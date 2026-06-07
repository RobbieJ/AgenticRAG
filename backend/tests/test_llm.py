"""Provider selection and shared helpers."""

from backend.config import settings as cfg
from backend.services.llm import base, get_llm_service


# --- shared helpers ---------------------------------------------------------
def test_parse_eval_extracts_json_with_surrounding_prose():
    raw = 'Sure! {"score": 0.84, "sufficient": true, "reasoning": "ok"} done.'
    out = base.parse_eval(raw)
    assert out["score"] == 0.84
    assert out["sufficient"] is True
    assert out["reasoning"] == "ok"


def test_parse_eval_clamps_and_handles_garbage():
    assert base.parse_eval("not json")["score"] == 0.5
    assert base.parse_eval('{"score": 9, "sufficient": true, "reasoning": "x"}')["score"] == 1.0


def test_plan_prompt_includes_feedback():
    p = base.plan_prompt("what is RAG?", "too vague")
    assert "what is RAG?" in p and "too vague" in p


# --- factory selection (monkeypatch the live settings object) ---------------
def test_factory_demo_without_credentials(monkeypatch):
    monkeypatch.setattr(cfg, "llm_provider", "anthropic")
    monkeypatch.setattr(cfg, "anthropic_api_key", "")
    svc = get_llm_service()
    assert svc.__class__.__name__ == "DemoLLMService"
    assert svc.provider == "anthropic"


def test_factory_openai_when_keyed(monkeypatch):
    monkeypatch.setattr(cfg, "llm_provider", "openai")
    monkeypatch.setattr(cfg, "openai_api_key", "sk-test")
    svc = get_llm_service()
    assert svc.__class__.__name__ == "OpenAICompatibleService"
    assert svc.provider == "openai"


def test_factory_vllm_when_model_set(monkeypatch):
    monkeypatch.setattr(cfg, "llm_provider", "vllm")
    monkeypatch.setattr(cfg, "vllm_model", "meta-llama/Llama-3.1-8B-Instruct")
    svc = get_llm_service()
    assert svc.__class__.__name__ == "OpenAICompatibleService"
    assert svc.provider == "vllm"


def test_vllm_is_demo_without_model(monkeypatch):
    monkeypatch.setattr(cfg, "llm_provider", "vllm")
    monkeypatch.setattr(cfg, "vllm_model", "")
    assert get_llm_service().__class__.__name__ == "DemoLLMService"


def test_provider_implements_interface(monkeypatch):
    monkeypatch.setattr(cfg, "llm_provider", "openai")
    monkeypatch.setattr(cfg, "openai_api_key", "sk-test")
    assert isinstance(get_llm_service(), base.LLMService)
