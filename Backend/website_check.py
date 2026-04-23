import requests

def check_single_website(url: str) -> dict:
    """
    Given a URL, checks if the website actually loads.
    Returns a dictionary explaining what we found.
    """
    
    # If Google Places has no website field at all
    if not url or url.strip() == "":
        return {
            "has_website": False,
            "reason": "not_listed",
            "detail": "Not listed in Google Places"
        }
    
    # Make sure URL starts with http or https
    clean_url = url.strip()
    if not clean_url.startswith("http"):
        clean_url = "https://" + clean_url
    
    try:
        # Try to actually visit the website
        # timeout=5 means we wait maximum 5 seconds
        # headers makes us look like a normal browser so sites don't block us
        response = requests.get(
            clean_url,
            timeout=5,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            allow_redirects=True  # Follow redirects (like http → https)
        )
        
        # HTTP status codes:
        # 200-399 = success (website works)
        # 400-499 = client error (forbidden, not found)
        # 500-599 = server error (website broken)
        
        if response.status_code < 400:
            return {
                "has_website": True,
                "url": clean_url,
                "status_code": response.status_code,
                "reason": "working",
                "detail": "Website is live"
            }
        else:
            return {
                "has_website": False,
                "url": clean_url,
                "status_code": response.status_code,
                "reason": "broken",
                "detail": f"Website returns error {response.status_code}"
            }
    
    except requests.exceptions.ConnectionError:
        # This happens when the domain doesn't exist at all
        return {
            "has_website": False,
            "url": clean_url,
            "reason": "domain_dead",
            "detail": "Domain does not exist or DNS failed"
        }
    
    except requests.exceptions.Timeout:
        # Website exists but takes too long to load
        return {
            "has_website": False,
            "url": clean_url,
            "reason": "timeout",
            "detail": "Website too slow or unresponsive"
        }
    
    except Exception as e:
        # Any other unexpected error
        return {
            "has_website": False,
            "url": clean_url,
            "reason": "unknown_error",
            "detail": str(e)
        }


def check_all_businesses(businesses: list) -> list:
    """
    Goes through every business in the list and checks their website.
    Adds website_status and needs_website fields to each business.
    """
    
    print("\n🌐 Checking website status for each business...")
    
    result = []
    
    for business in businesses:
        # Check this business's website
        status = check_single_website(business.get("website", ""))
        
        # Add the status info to the business dictionary
        business["website_status"] = status
        # True if they need a website, False if they already have one
        business["needs_website"] = not status["has_website"]
        
        result.append(business)
        
        # Print what we found
        icon = "✅" if status["has_website"] else "❌"
        print(f"   {icon} {business['name']}: {status['detail']}")
    
    return result