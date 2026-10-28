from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()
GOOD = {'username': 'sam', 'email': 'sam@example.com', 'password': 'Pw-test-12345'}


class AuthFlowTests(APITestCase):
    def test_register_then_login(self):
        res = self.client.post('/api/register/', GOOD, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(User.objects.filter(username='sam').exists())
        self.assertNotEqual(User.objects.get(username='sam').password, GOOD['password'])  # hashed

        res = self.client.post('/api/token/', {'username': 'sam', 'password': GOOD['password']}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)

    def test_duplicate_username_rejected(self):
        self.client.post('/api/register/', GOOD, format='json')
        res = self.client.post('/api/register/', {**GOOD, 'email': 'other@example.com'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_weak_password_rejected(self):
        res = self.client.post('/api/register/', {**GOOD, 'password': '123'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_wrong_password_rejected(self):
        self.client.post('/api/register/', GOOD, format='json')
        res = self.client.post('/api/token/', {'username': 'sam', 'password': 'wrong'}, format='json')
        self.assertEqual(res.status_code, 401)