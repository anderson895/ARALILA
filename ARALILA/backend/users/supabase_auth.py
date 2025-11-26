import os
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomUser
from datetime import date, timedelta

class SupabaseAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(
                token,
                os.getenv('SUPABASE_JWT_SECRET'),
                algorithms=['HS256'],
                audience='authenticated',
                leeway=300
            )
            
            user_id = payload.get('sub')
            email = payload.get('email')
            user_metadata = payload.get('user_metadata', {})

            user, created = CustomUser.objects.get_or_create(
                supabase_user_id=user_id,
                defaults={
                    'email': email,
                    'first_name': user_metadata.get('first_name', ''),
                    'last_name': user_metadata.get('last_name', ''),
                    'school_name': user_metadata.get('school_name', ''),
                }
            )

            # ---- UPDATE NAME INFO IF CHANGED ----
            if not created:
                updated = False
                if user.email != email:
                    user.email = email
                    updated = True
                if user.first_name != user_metadata.get('first_name', ''):
                    user.first_name = user_metadata.get('first_name', '')
                    updated = True
                if user.last_name != user_metadata.get('last_name', ''):
                    user.last_name = user_metadata.get('last_name', '')
                    updated = True
                
                if updated:
                    user.save()

            # ---- LOGIN STREAK LOGIC HERE ----
            today = date.today()

            if user.last_login_date is None:
                # First login ever
                user.ls_points = 1
            else:
                # Check streak
                if user.last_login_date == today - timedelta(days=1):
                    # Consecutive day → +1 point
                    user.ls_points += 1
                elif user.last_login_date == today:
                    # Same-day login → do nothing
                    pass
                else:
                    # Missed a day → reset streak
                    user.ls_points = 1

            # Update login date
            user.last_login_date = today
            user.save()

            # ---- RETURN USER ----
            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
