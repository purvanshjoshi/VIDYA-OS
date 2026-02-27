from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RAGService:
    """
    Sovereign RAG Service using Qdrant (Cloud or Local).
    Indexes campus-specific knowledge to ground AI responses.
    """
    
    def __init__(self):
        self.encoder = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.collection_name = settings.COLLECTION_NAME
        
        # Connect to Qdrant (Cloud if API key set, else Local)
        if settings.QDRANT_API_KEY:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
            logger.info("Connected to Qdrant Cloud Cluster")
        else:
            self.client = QdrantClient(url=settings.QDRANT_URL)
            logger.info(f"Connected to local Qdrant at {settings.QDRANT_URL}")

    def search(self, query: str, limit: int = 3):
        """Retrieves top-K relevant campus knowledge snippets."""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            if not any(c.name == self.collection_name for c in collections.collections):
                return []

            query_vector = self.encoder.encode(query).tolist()
            
            hits = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit
            )
            
            return [hit.payload.get("text", "") for hit in hits if hit.payload]
        except Exception as e:
            logger.error(f"RAG Search Error: {e}")
            return []

    def index_document(self, text: str, metadata: dict = None):
        """Indexes a new document into the campus knowledge base."""
        # This would be used in the 'BUILD' or administrative flows
        pass

rag_service = RAGService()
