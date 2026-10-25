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

    cursor.execute(query, (conversation_id, title))
    connection.commit()

    cursor.close()
    connection.close()

    return conversation_id


def save_message(conversation_id, role, content):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO messages (conversation_id, role, content)
        VALUES (%s, %s, %s)
    """

    cursor.execute(query, (conversation_id, role, content))
    connection.commit()

    cursor.close()
    connection.close()


def get_history(conversation_id):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT role, content
        FROM messages
        WHERE conversation_id = %s
        ORDER BY created_at ASC, id ASC
    """

    cursor.execute(query, (conversation_id,))
    history = cursor.fetchall()

    cursor.close()
    connection.close()

    return history