import os
import sys
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.api_core.client_options import ClientOptions
from google.cloud import modelarmor_v1

from agents.utils.logging import get_logger


logger = get_logger(__name__)


class ModelArmorClient:
    """Small wrapper around Model Armor with graceful fallbacks."""

    def __init__(self, project_id: str, location: str, template_id: str):
        self.client = None
        self.template_name = ''

        if not project_id or not location or not template_id:
            logger.warning('⚠️ Model Armor disabled: missing project, location, or template configuration')
            return

        try:
            self.client = modelarmor_v1.ModelArmorClient(
                transport='rest',
                client_options=ClientOptions(
                    api_endpoint=f'modelarmor.{location}.rep.googleapis.com'
                ),
            )
            self.template_name = (
                f'projects/{project_id}/locations/{location}/templates/{template_id}'
            )
        except Exception as exc:
            logger.warning('⚠️ Model Armor init fallback: %s', exc)
            self.client = None
            self.template_name = ''

    def sanitize_input(self, text: str) -> tuple[bool, str]:
        """Returns (is_safe, reason) for user input."""
        if not self.client or not self.template_name or not text.strip():
            return True, ''

        try:
            logger.info('🛡️ Model Armor input check')
            request = modelarmor_v1.SanitizeUserPromptRequest(
                name=self.template_name,
                user_prompt_data=modelarmor_v1.DataItem(text=text),
            )
            response = self.client.sanitize_user_prompt(request=request)
            match_state = response.sanitization_result.filter_match_state
            is_safe = match_state != modelarmor_v1.FilterMatchState.MATCH_FOUND
            reason = self._extract_reason(response)
            if not is_safe:
                logger.warning('❌ Model Armor blocked input: %s', reason or 'matched policy filter')
            return is_safe, reason
        except Exception as exc:
            logger.warning('⚠️ Model Armor input fallback: %s', exc)
            return True, ''

    def sanitize_output(self, text: str) -> tuple[bool, str]:
        """Returns (is_safe, reason) for model output."""
        if not self.client or not self.template_name or not text.strip():
            return True, ''

        try:
            logger.info('🛡️ Model Armor output check')
            request = modelarmor_v1.SanitizeModelResponseRequest(
                name=self.template_name,
                model_response_data=modelarmor_v1.DataItem(text=text),
            )
            response = self.client.sanitize_model_response(request=request)
            match_state = response.sanitization_result.filter_match_state
            is_safe = match_state != modelarmor_v1.FilterMatchState.MATCH_FOUND
            reason = self._extract_reason(response)
            if not is_safe:
                logger.warning('❌ Model Armor filtered output: %s', reason or 'matched policy filter')
            return is_safe, reason
        except Exception as exc:
            logger.warning('⚠️ Model Armor output fallback: %s', exc)
            return True, ''

    def _extract_reason(self, response: Any) -> str:
        sanitization_result = getattr(response, 'sanitization_result', None)
        if sanitization_result is None:
            return ''

        filter_results = getattr(sanitization_result, 'filter_results', None) or []
        reasons: list[str] = []

        for filter_result in filter_results:
            reason = self._extract_filter_reason(filter_result)
            if reason and reason not in reasons:
                reasons.append(reason)

        return '; '.join(reasons[:3])

    def _extract_filter_reason(self, filter_result: Any) -> str:
        direct_fields = []
        for field_name in ('filter_type', 'match_state', 'confidence_level'):
            value = getattr(filter_result, field_name, None)
            if value not in (None, '', 0):
                direct_fields.append(str(value))

        if direct_fields:
            return ' '.join(direct_fields)

        raw_text = str(filter_result).strip().replace('\n', ' ')
        return raw_text[:200] if raw_text else ''
