# Error handling contract

Every failure has four layers:

1. **Technical classification** - stable machine-readable code.
2. **Recovery policy** - retry, fallback, re-auth, user action, or fail closed.
3. **Telemetry** - redacted event with no journal contents or purchase receipt secrets.
4. **UX copy** - short, calm, actionable message.

Avoid `catch {}` blocks that silently turn a feature off. A catch block should either:

- recover;
- return a typed failure;
- log a redacted error;
- rethrow a normalized domain error.

Never include the following in error telemetry:

- journal text;
- access tokens;
- OAuth codes;
- receipt payloads;
- subscription webhooks;
- email address unless strictly needed by the backend audit trail;
- full request URLs containing tokens/query secrets.
