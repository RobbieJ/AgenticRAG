"""Input sanitization for user-supplied query text.

The query reaches the LLM as a prompt, so we strip control characters (which can
corrupt logs and terminals) and clamp length defensively. ``MAX_QUERY_LEN`` is
also enforced at the API boundary by FastAPI's ``Query(max_length=...)`` so
oversized requests are rejected with a 422 before any work begins.
"""

from __future__ import annotations

import re
from typing import Optional

MAX_QUERY_LEN = 2000

# Strip ASCII control chars except tab/newline/carriage-return.
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def sanitize_query(query: Optional[str]) -> Optional[str]:
    """Trim, strip control characters, and clamp length. Returns None if empty."""
    if query is None:
        return None
    cleaned = _CONTROL_CHARS.sub("", query).strip()
    cleaned = cleaned[:MAX_QUERY_LEN]
    return cleaned or None
