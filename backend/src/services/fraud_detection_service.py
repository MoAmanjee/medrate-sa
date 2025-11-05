"""
Fraud Detection Service
AI-powered fraud detection for document verification
"""
import os
import openai
from typing import Dict, List, Optional
from datetime import datetime


class FraudDetectionService:
    """Service for detecting fraudulent documents using AI and heuristics"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.mock_mode = os.getenv("OPENAI_MOCK_MODE", "false").lower() == "true"
        
        if not self.mock_mode and self.openai_key:
            openai.api_key = self.openai_key
    
    def analyze_documents(
        self,
        documents: Dict[str, str]  # {document_type: s3_url}
    ) -> Dict[str, any]:
        """
        Analyze documents for fraud detection
        
        Returns:
        - risk_score: 0-100
        - risk_level: low, medium, high
        - flags: List of suspicious elements
        - confidence: Confidence in analysis (0-1)
        """
        risk_score = 0
        flags = []
        
        # 1. Heuristic checks
        heuristic_results = self._run_heuristic_checks(documents)
        risk_score += heuristic_results["risk_score"]
        flags.extend(heuristic_results["flags"])
        
        # 2. AI analysis (if enabled)
        if not self.mock_mode and self.openai_key:
            ai_results = self._run_ai_analysis(documents)
            risk_score += ai_results["risk_score"]
            flags.extend(ai_results["flags"])
        else:
            # Mock AI analysis
            ai_results = self._mock_ai_analysis(documents)
            risk_score += ai_results["risk_score"]
            flags.extend(ai_results["flags"])
        
        # 3. Document consistency check
        consistency_results = self._check_document_consistency(documents)
        risk_score += consistency_results["risk_score"]
        flags.extend(consistency_results["flags"])
        
        # Cap risk score at 100
        risk_score = min(risk_score, 100)
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "high"
        elif risk_score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "flags": flags,
            "confidence": 0.85 if risk_score > 50 else 0.95,
            "analyzed_at": datetime.utcnow().isoformat(),
            "details": {
                "heuristic_checks": heuristic_results,
                "ai_analysis": ai_results,
                "consistency_check": consistency_results
            }
        }
    
    def _run_heuristic_checks(self, documents: Dict[str, str]) -> Dict:
        """Run heuristic-based fraud detection"""
        risk_score = 0
        flags = []
        
        # Check for missing documents
        required_docs = ["hpcsa_certificate", "government_id", "proof_of_practice"]
        missing_docs = [doc for doc in required_docs if doc not in documents]
        if missing_docs:
            risk_score += 20
            flags.append({
                "type": "missing_documents",
                "severity": "medium",
                "message": f"Missing required documents: {', '.join(missing_docs)}"
            })
        
        # Check document metadata (if available)
        # This would check file sizes, creation dates, etc.
        for doc_type, doc_url in documents.items():
            # Placeholder: Check for suspicious file sizes
            # In production, fetch metadata from S3
            if self._is_suspicious_file_size(doc_url):
                risk_score += 10
                flags.append({
                    "type": "suspicious_file_size",
                    "severity": "low",
                    "message": f"{doc_type} has unusual file size"
                })
        
        return {
            "risk_score": risk_score,
            "flags": flags
        }
    
    def _run_ai_analysis(self, documents: Dict[str, str]) -> Dict:
        """Run AI-based document analysis using OpenAI Vision"""
        risk_score = 0
        flags = []
        
        try:
            # Analyze each document
            for doc_type, doc_url in documents.items():
                analysis = self._analyze_document_with_ai(doc_url, doc_type)
                
                if analysis.get("suspicious"):
                    risk_score += 15
                    flags.append({
                        "type": "ai_detected_suspicious",
                        "severity": "medium",
                        "document": doc_type,
                        "message": analysis.get("message", "AI detected suspicious elements"),
                        "confidence": analysis.get("confidence", 0.7)
                    })
                
                if analysis.get("manipulation_detected"):
                    risk_score += 25
                    flags.append({
                        "type": "image_manipulation",
                        "severity": "high",
                        "document": doc_type,
                        "message": "Possible image manipulation detected"
                    })
        
        except Exception as e:
            # If AI analysis fails, increase risk slightly
            risk_score += 5
            flags.append({
                "type": "ai_analysis_failed",
                "severity": "low",
                "message": f"AI analysis unavailable: {str(e)}"
            })
        
        return {
            "risk_score": min(risk_score, 50),  # Cap AI risk at 50
            "flags": flags
        }
    
    def _analyze_document_with_ai(self, document_url: str, doc_type: str) -> Dict:
        """Use OpenAI Vision API to analyze document"""
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a document verification expert. Analyze documents for authenticity, signs of manipulation, and verify text consistency."
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"Analyze this {doc_type} document. Check for: 1) Signs of image manipulation or editing, 2) Text consistency and readability, 3) Document authenticity markers. Return JSON with: suspicious (boolean), manipulation_detected (boolean), confidence (0-1), message (string)."
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": document_url}
                            }
                        ]
                    }
                ],
                max_tokens=200
            )
            
            # Parse response (simplified - in production, use proper JSON parsing)
            content = response.choices[0].message.content
            
            # Extract JSON from response
            import json
            try:
                analysis = json.loads(content)
            except:
                # Fallback: parse text response
                analysis = {
                    "suspicious": "suspicious" in content.lower(),
                    "manipulation_detected": "manipulation" in content.lower(),
                    "confidence": 0.7,
                    "message": content
                }
            
            return analysis
            
        except Exception as e:
            return {
                "suspicious": False,
                "manipulation_detected": False,
                "confidence": 0.5,
                "message": f"AI analysis failed: {str(e)}"
            }
    
    def _mock_ai_analysis(self, documents: Dict[str, str]) -> Dict:
        """Mock AI analysis for development"""
        # Simulate low risk for most cases
        # In production, this would be replaced with real AI analysis
        
        # Simulate occasional medium risk
        import random
        if random.random() < 0.1:  # 10% chance of medium risk
            return {
                "risk_score": 15,
                "flags": [{
                    "type": "ai_detected_suspicious",
                    "severity": "medium",
                    "message": "Mock AI detected minor inconsistencies"
                }]
            }
        
        return {
            "risk_score": 0,
            "flags": []
        }
    
    def _check_document_consistency(self, documents: Dict[str, str]) -> Dict:
        """Check consistency across documents"""
        risk_score = 0
        flags = []
        
        # Extract text from documents (OCR would be used in production)
        # For now, this is a placeholder
        
        # Check name consistency
        # Check date consistency
        # Check signature consistency
        
        # Placeholder: Check if documents seem consistent
        if len(documents) < 3:
            risk_score += 10
            flags.append({
                "type": "insufficient_documents",
                "severity": "low",
                "message": "Fewer than expected documents provided"
            })
        
        return {
            "risk_score": risk_score,
            "flags": flags
        }
    
    def _is_suspicious_file_size(self, file_url: str) -> bool:
        """Check if file size is suspicious"""
        # In production, fetch file metadata from S3
        # Placeholder: return False
        return False


# Factory function
def get_fraud_detection_service() -> FraudDetectionService:
    """Factory function for dependency injection"""
    return FraudDetectionService()

