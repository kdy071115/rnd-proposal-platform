"""Government R&D API integration service.

This module handles API calls to government R&D notice services:
- NTIS (National Science & Technology Information Service)
- K-Startup (Korea Startup Portal)
"""
import requests
from typing import List, Dict, Optional
from datetime import datetime

from app.core.config import settings


class GovernmentAPIClient:
    """Client for government R&D APIs."""
    
    def __init__(self):
        self.ntis_api_key = getattr(settings, 'NTIS_API_KEY', None)
        self.kstartup_api_key = getattr(settings, 'KSTARTUP_API_KEY', None)
        self.use_mock = not (self.ntis_api_key and self.kstartup_api_key)
    
    def fetch_ntis_notices(self) -> List[Dict]:
        """Fetch R&D notices from NTIS API."""
        if self.use_mock:
            return self._get_mock_ntis_data()
        
        try:
            url = "https://www.ntis.go.kr/openapi/service/RnDNoticeService/getRnDNoticeList"
            params = {
                "serviceKey": self.ntis_api_key,
                "numOfRows": 50,
                "pageNo": 1,
                "_type": "json"
            }
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return self._parse_ntis_response(data)
        except Exception as e:
            print(f"[ERROR] NTIS API call failed: {e}")
            return self._get_mock_ntis_data()
    
    def fetch_kstartup_notices(self) -> List[Dict]:
        """Fetch startup support notices from K-Startup API."""
        if self.use_mock:
            return self._get_mock_kstartup_data()
        
        try:
            url = "https://api.odcloud.kr/api/StartupNotice/v1/getStartupNoticeList"
            params = {
                "serviceKey": self.kstartup_api_key,
                "numOfRows": 50,
                "pageNo": 1,
                "type": "json"
            }
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return self._parse_kstartup_response(data)
        except Exception as e:
            print(f"[ERROR] K-Startup API call failed: {e}")
            return self._get_mock_kstartup_data()
    
    def fetch_all_notices(self) -> List[Dict]:
        """Fetch notices from all government APIs."""
        notices = []
        notices.extend(self.fetch_ntis_notices())
        notices.extend(self.fetch_kstartup_notices())
        return notices
    
    def _parse_ntis_response(self, data: Dict) -> List[Dict]:
        """Parse NTIS API response to standard format."""
        notices = []
        items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
        
        for item in items:
            notices.append({
                "title": item.get("taskNm", ""),
                "department": item.get("instNm", ""),
                "sector": self._map_sector(item.get("techFieldNm", "")),
                "min_year": int(item.get("minCompanyAge", 0)),
                "max_year": int(item.get("maxCompanyAge", 100)),
                "grant_amount": int(item.get("totAmt", 0)) // 100000000,  # Convert to 억원
                "deadline": item.get("rcptEndDt", ""),
                "source": "NTIS"
            })
        
        return notices
    
    def _parse_kstartup_response(self, data: Dict) -> List[Dict]:
        """Parse K-Startup API response to standard format."""
        notices = []
        items = data.get("data", [])
        
        for item in items:
            notices.append({
                "title": item.get("bizNm", ""),
                "department": item.get("instNm", "창업진흥원"),
                "sector": "All",
                "min_year": 0,
                "max_year": int(item.get("maxCompanyAge", 100)),
                "grant_amount": int(item.get("supportAmt", 0)) // 100000000,
                "deadline": item.get("endDt", ""),
                "source": "K-Startup"
            })
        
        return notices
    
    def _map_sector(self, tech_field: str) -> str:
        """Map technology field to sector."""
        sector_mapping = {
            "정보통신": "IT/Software",
            "소프트웨어": "IT/Software",
            "바이오": "Bio/Health",
            "헬스케어": "Bio/Health",
            "제조": "Manufacturing",
            "에너지": "Energy",
        }
        
        for key, value in sector_mapping.items():
            if key in tech_field:
                return value
        
        return "All"
    
    def _get_mock_ntis_data(self) -> List[Dict]:
        """Mock NTIS data for development."""
        return [
            {
                "title": "2024년 중소기업 기술혁신개발사업",
                "department": "중소벤처기업부",
                "sector": "IT/Software",
                "min_year": 1,
                "max_year": 10,
                "grant_amount": 300,
                "deadline": "2024-06-30",
                "source": "NTIS"
            },
            {
                "title": "AI 반도체 핵심기술 개발",
                "department": "과학기술정보통신부",
                "sector": "IT/Software",
                "min_year": 3,
                "max_year": 100,
                "grant_amount": 500,
                "deadline": "2024-05-31",
                "source": "NTIS"
            },
            {
                "title": "바이오 신약 개발 지원사업",
                "department": "보건복지부",
                "sector": "Bio/Health",
                "min_year": 0,
                "max_year": 100,
                "grant_amount": 400,
                "deadline": "2024-07-15",
                "source": "NTIS"
            },
        ]
    
    def _get_mock_kstartup_data(self) -> List[Dict]:
        """Mock K-Startup data for development."""
        return [
            {
                "title": "2024년 초기창업패키지",
                "department": "창업진흥원",
                "sector": "All",
                "min_year": 0,
                "max_year": 3,
                "grant_amount": 100,
                "deadline": "2024-04-30",
                "source": "K-Startup"
            },
            {
                "title": "창업도약패키지 (도약기)",
                "department": "창업진흥원",
                "sector": "All",
                "min_year": 3,
                "max_year": 7,
                "grant_amount": 200,
                "deadline": "2024-05-20",
                "source": "K-Startup"
            },
            {
                "title": "글로벌 액셀러레이팅",
                "department": "창업진흥원",
                "sector": "IT/Software",
                "min_year": 3,
                "max_year": 10,
                "grant_amount": 150,
                "deadline": "2024-06-10",
                "source": "K-Startup"
            },
        ]


# Singleton instance
api_client = GovernmentAPIClient()
