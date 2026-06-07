from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class DemoTypeEnum(str, Enum):
    WHAT_IS_AI = "what-is-ai"
    RAG_COMPARISON = "rag-comparison"
    AGENTIC_LOOP = "agentic-loop"


class DemoExecuteRequest(BaseModel):
    demoType: DemoTypeEnum
    query: Optional[str] = None


class DocumentModel(BaseModel):
    id: str
    title: str
    text: str
    score: Optional[float] = None


class DemoEvent(BaseModel):
    step: int
    name: str
    description: Optional[str] = None
    codeBlock: Optional[str] = None
    highlightDiagram: Optional[List[str]] = None
    executionTime: Optional[float] = None
    results: Optional[List[dict]] = None
    score: Optional[float] = None
    reasoning: Optional[str] = None
    response: Optional[str] = None
    decision: Optional[str] = None
    finalResult: Optional[dict] = None
    looping: Optional[bool] = None


class HealthResponse(BaseModel):
    status: str
    version: str
