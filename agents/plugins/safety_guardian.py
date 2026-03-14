import os
import sys
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from google.adk.models.llm_response import LlmResponse
from google.adk.plugins import BasePlugin
from google.genai import types

from agents.utils.logging import get_logger


logger = get_logger(__name__)

FRIENDLY_REDIRECT = (
    'I can help with anime schedules, group watch planning, and budget calculations. '
    'What would you like to do?'
)


class SafetyGuardianPlugin(BasePlugin):
    """Dual-layer safety: Model Armor plus LLM-as-a-Judge."""

    def __init__(self, model_armor_client=None, judge=None):
        super().__init__(name='safety_guardian')
        self.armor = model_armor_client
        self.judge = judge

    async def before_model_callback(self, *, callback_context, llm_request):
        if self._is_passthrough():
            return None

        user_text = self._extract_user_text(llm_request)
        if not user_text:
            return None

        if self.armor is not None:
            try:
                is_safe, reason = self.armor.sanitize_input(user_text)
            except Exception as exc:
                logger.warning('⚠️ SafetyGuardian armor input fallback: %s', exc)
                is_safe, reason = True, ''
            self._record_trace(callback_context, 'input_model_armor', is_safe, reason)
            if not is_safe:
                return self._blocked_response(
                    f'Request blocked by safety filter: {reason or "policy match detected"}'
                )

        if self.judge is not None:
            try:
                verdict = await self.judge.evaluate_input(user_text)
            except Exception as exc:
                logger.warning('⚠️ SafetyGuardian judge input fallback: %s', exc)
                verdict = {'safe': True}
            self._record_trace(
                callback_context,
                'input_judge',
                verdict.get('safe', True),
                verdict.get('message', ''),
            )
            if not verdict.get('safe', True):
                return self._blocked_response(
                    verdict.get('message') or 'That request is outside AniKrewe scope.'
                )

        return None

    async def after_model_callback(self, *, callback_context, llm_response):
        if self._is_passthrough():
            return None

        response_text = self._extract_response_text(llm_response)
        if not response_text:
            return None

        if self.armor is not None:
            try:
                is_safe, reason = self.armor.sanitize_output(response_text)
            except Exception as exc:
                logger.warning('⚠️ SafetyGuardian armor output fallback: %s', exc)
                is_safe, reason = True, ''
            self._record_trace(callback_context, 'output_model_armor', is_safe, reason)
            if not is_safe:
                return self._blocked_response(
                    f'Response filtered by safety guardrail: {reason or "policy match detected"}'
                )

        if self.judge is not None:
            try:
                verdict = await self.judge.evaluate_output(response_text)
            except Exception as exc:
                logger.warning('⚠️ SafetyGuardian judge output fallback: %s', exc)
                verdict = {'safe': True}
            self._record_trace(
                callback_context,
                'output_judge',
                verdict.get('safe', True),
                verdict.get('message', ''),
            )
            if not verdict.get('safe', True):
                return self._blocked_response(
                    verdict.get('message') or 'I need to keep the answer within AniKrewe scope.'
                )

        return None

    def _blocked_response(self, message: str) -> LlmResponse:
        logger.warning('❌ SafetyGuardian blocked content: %s', message)
        return LlmResponse(
            content=types.Content(
                role='model',
                parts=[
                    types.Part(
                        text=f'{message}\n\n{FRIENDLY_REDIRECT}'
                    )
                ],
            ),
            turn_complete=True,
            custom_metadata={
                'guardrail': {
                    'blocked': True,
                    'message': message,
                    'redirect': FRIENDLY_REDIRECT,
                }
            },
        )

    def _extract_user_text(self, llm_request) -> str:
        texts: list[str] = []
        for content in getattr(llm_request, 'contents', []) or []:
            for part in getattr(content, 'parts', []) or []:
                text = getattr(part, 'text', None)
                if text:
                    texts.append(text.strip())
        return '\n'.join(text for text in texts if text)

    def _extract_response_text(self, llm_response) -> str:
        texts: list[str] = []
        content = getattr(llm_response, 'content', None)
        for part in getattr(content, 'parts', []) or []:
            text = getattr(part, 'text', None)
            is_thought = bool(getattr(part, 'thought', False))
            if text and not is_thought:
                texts.append(text.strip())
        return '\n'.join(text for text in texts if text)

    def _record_trace(
        self,
        callback_context,
        stage: str,
        is_safe: bool,
        detail: str,
    ) -> None:
        try:
            trace = list(callback_context.state.get('guardrail_trace', []))
            trace.append(
                {
                    'stage': stage,
                    'safe': is_safe,
                    'detail': detail,
                }
            )
            callback_context.state['guardrail_trace'] = trace[-10:]
        except Exception as exc:
            logger.warning('⚠️ Guardrail trace fallback: %s', exc)

    def _is_passthrough(self) -> bool:
        return self.armor is None and self.judge is None
