from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Association table for Document <-> Tag
document_tags = Table(
    'document_tags',
    Base.metadata,
    Column('document_id', Integer, ForeignKey('documents.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)  # Original full content
    source_type = Column(String)  # 'pdf', 'docx', 'url', 'text'
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=document_tags, back_populates="documents")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    content = Column(Text)
    chunk_index = Column(Integer)
    embedding_id = Column(String, nullable=True)  # Qdrant point ID
    
    document = relationship("Document", back_populates="chunks")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    documents = relationship("Document", secondary=document_tags, back_populates="tags")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String)  # 'user', 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'person', 'concept', 'org', 'tech', etc.
    document_id = Column(Integer, ForeignKey("documents.id"))
    
    document = relationship("Document", back_populates="entities")

# Add relationship to Document class
Document.entities = relationship("Entity", back_populates="document", cascade="all, delete-orphan")
