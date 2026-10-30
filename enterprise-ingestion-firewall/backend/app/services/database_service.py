from uuid import uuid4

import mysql.connector

from app.config import (
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USER,
)


def get_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        database=MYSQL_DATABASE,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
    )


def create_conversation(title="New Chat"):
    conversation_id = str(uuid4())

    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO conversations (id, title)
        VALUES (%s, %s)
    """

    cursor.execute(
        query,
        (conversation_id, title),
    )

    connection.commit()

    cursor.close()
    connection.close()

    return conversation_id


def save_message(conversation_id, role, content):
    if role not in {"user", "assistant"}:
        raise ValueError(
            "Invalid role. Role must be 'user' or 'assistant'."
        )

    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO messages (conversation_id, role, content)
        VALUES (%s, %s, %s)
    """

    cursor.execute(
        query,
        (
            conversation_id,
            role,
            content,
        ),
    )

    # Use the first user message as the conversation title.
    if role == "user":
        title_query = """
            UPDATE conversations
            SET title = %s
            WHERE id = %s
              AND title = 'New Chat'
        """

        title = content.strip()

        if len(title) > 60:
            title = title[:57] + "..."

        cursor.execute(
            title_query,
            (
                title,
                conversation_id,
            ),
        )

    update_query = """
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """

    cursor.execute(
        update_query,
        (conversation_id,),
    )

    connection.commit()

    cursor.close()
    connection.close()


def get_history(conversation_id, limit=12):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT role, content, created_at
        FROM (
            SELECT
                role,
                content,
                created_at,
                id
            FROM messages
            WHERE conversation_id = %s
            ORDER BY created_at DESC, id DESC
            LIMIT %s
        ) AS recent_messages
        ORDER BY created_at ASC, id ASC
    """

    cursor.execute(
        query,
        (
            conversation_id,
            limit,
        ),
    )

    history = cursor.fetchall()

    cursor.close()
    connection.close()

    return history


def list_conversations():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            id,
            title,
            created_at,
            updated_at
        FROM conversations
        ORDER BY updated_at DESC, created_at DESC
    """

    cursor.execute(query)

    conversations = cursor.fetchall()

    cursor.close()
    connection.close()

    return conversations


def get_conversation_messages(conversation_id):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            id,
            role,
            content,
            created_at
        FROM messages
        WHERE conversation_id = %s
        ORDER BY created_at ASC, id ASC
    """

    cursor.execute(
        query,
        (conversation_id,),
    )

    messages = cursor.fetchall()

    cursor.close()
    connection.close()

    return messages