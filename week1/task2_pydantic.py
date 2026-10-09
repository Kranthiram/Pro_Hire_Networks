from pydantic import BaseModel, Field, field_validator, ValidationError
import re

class UserProfile(BaseModel):
    name : str = Field(min_length = 2)
    age : int = Field(ge=18, le=100)
    email : str 
    pan : str

    @field_validator("email")
    @classmethod
    def validate_email(cls,value):
        if "@" not in value:
            raise ValueError("Invalid email address")
        return value

    @field_validator("pan")
    @classmethod
    def validate_pan(cls,value):
        pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]$"

        if not re.fullmatch(pattern,value):
            raise ValueError("Invalid PAN format")

        return value


try:
    user = UserProfile(
    name = "K",
    age = 2,
    email = "akgmail.com",
    pan = "AK2LU1437K"
    )

    print(user)
except ValidationError as e:
    print("Validation failed: ")
    print(e)

