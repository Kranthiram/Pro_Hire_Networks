# Pro_Hire_Networks

## Week 1 – LLM APIs, Pydantic & Instructor

### Task 1 – Groq API

- Groq API ni Python lo use chesa.
- `.env` file nundi `GROQ_API_KEY` read chesa.
- `Groq()` client create chesi LLM ki request send chesa.
- Response ni print chesa.

Main concepts:
- API Key
- Environment Variables
- Groq Client
- Chat Completions

---

### Task 2 – Pydantic

Pydantic use chesi `UserProfile` model create chesa.

Fields:
- name
- age
- email
- pan

Used:

- `BaseModel` → Pydantic model create cheyadaniki
- `Field` → field constraints pettadaniki
- `@field_validator` → custom validation kosam
- `ValidationError` → invalid data vachinappudu errors handle cheyadaniki

Example validations:

- Name minimum length
- Age 18–100
- Email validation
- PAN format validation

---

### Task 3 – Instructor + Groq + Pydantic

Instructor ni Groq tho integrate chesa.

Flow:

User Prompt
↓
Groq LLM
↓
Instructor
↓
Pydantic Validation
↓
UserProfile Object

Important:

`response_model=UserProfile`

Idi LLM response ni expected Pydantic structure lo generate cheyadaniki use avutundi.

Without Instructor:

LLM → Raw Text

With Instructor:

LLM → Structured Pydantic Object

---

## Important Concepts

### BaseModel
Pydantic lo structured data model create cheyadaniki.

### Field
Field ki constraints/metadata define cheyadaniki.

### field_validator
Custom validation logic rayadaniki.

### ValidationError
Validation fail ayinappudu Pydantic raise chese error.

### Instructor
LLM responses ni structured format lo obtain cheyadaniki.

### response_model
LLM output ye Pydantic model format lo undalo specify chestundi.

---

## Week 1 Flow

Groq API
→ Pydantic
→ Instructor
→ Structured Output
→ Validation