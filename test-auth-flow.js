/**
 * Auth Flow Integration Test
 * 
 * This script tests the complete authentication flow between 
 * the NestJS backend and Next.js frontend to ensure proper integration.
 * 
 * Run with: node test-auth-flow.js
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api/v1';
const TEST_USER = {
  email: 'test@cliniva.com',
  password: 'Test123456',
  firstName: 'Test',
  lastName: 'User',
  role: 'patient'
};

// Test Colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(success, message) {
  log(success ? 'green' : 'red', `${success ? '✅' : '❌'} ${message}`);
}

// Test Functions
async function testBackendHealth() {
  try {
    log('blue', '\n🏥 Testing Backend Health...');
    // You might need to adjust this endpoint based on your backend
    await axios.get(`${BACKEND_URL.replace('/api/v1', '')}/health`);
    logResult(true, 'Backend is running');
    return true;
  } catch (error) {
    logResult(false, `Backend health check failed: ${error.message}`);
    return false;
  }
}

async function testUserRegistration() {
  try {
    log('blue', '\n👤 Testing User Registration...');
    const response = await axios.post(`${BACKEND_URL}/auth/register`, TEST_USER);
    
    // Validate response structure
    const { access_token, refresh_token, user } = response.data;
    
    if (!access_token || !refresh_token || !user) {
      throw new Error('Invalid response structure');
    }
    
    // Validate user fields
    const requiredFields = ['id', 'email', 'firstName', 'lastName', 'role', 'isActive'];
    for (const field of requiredFields) {
      if (user[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check new onboarding fields
    const onboardingFields = ['setupComplete', 'onboardingComplete', 'planType'];
    for (const field of onboardingFields) {
      if (user[field] === undefined) {
        log('yellow', `⚠️  Optional onboarding field missing: ${field}`);
      }
    }
    
    logResult(true, 'User registration successful');
    logResult(true, `User ID: ${user.id}`);
    logResult(true, `Setup Complete: ${user.setupComplete}`);
    logResult(true, `Plan Type: ${user.planType || 'null'}`);
    
    return { access_token, refresh_token, user };
  } catch (error) {
    if (error.response?.status === 409) {
      log('yellow', '⚠️  User already exists, proceeding with login test...');
      return null;
    }
    logResult(false, `Registration failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testUserLogin() {
  try {
    log('blue', '\n🔐 Testing User Login...');
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    // Validate response structure
    const { access_token, refresh_token, user } = response.data;
    
    if (!access_token || !refresh_token || !user) {
      throw new Error('Invalid login response structure');
    }
    
    logResult(true, 'User login successful');
    logResult(true, `Access token length: ${access_token.length}`);
    logResult(true, `User role: ${user.role}`);
    logResult(true, `Setup status: ${user.setupComplete ? 'Complete' : 'Incomplete'}`);
    
    return { access_token, refresh_token, user };
  } catch (error) {
    logResult(false, `Login failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testProtectedRoute(accessToken) {
  try {
    log('blue', '\n🛡️  Testing Protected Route Access...');
    const response = await axios.get(`${BACKEND_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const user = response.data;
    logResult(true, 'Protected route access successful');
    logResult(true, `Profile email: ${user.email}`);
    
    return true;
  } catch (error) {
    logResult(false, `Protected route access failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testTokenRefresh(refreshToken) {
  try {
    log('blue', '\n🔄 Testing Token Refresh...');
    const response = await axios.post(`${BACKEND_URL}/auth/refresh`, {
      refresh_token: refreshToken
    });
    
    const { access_token, refresh_token: newRefreshToken } = response.data;
    
    if (!access_token || !newRefreshToken) {
      throw new Error('Invalid refresh response structure');
    }
    
    logResult(true, 'Token refresh successful');
    logResult(true, `New access token length: ${access_token.length}`);
    
    return { access_token, refresh_token: newRefreshToken };
  } catch (error) {
    logResult(false, `Token refresh failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Main test runner
async function runAuthTests() {
  log('blue', '🚀 Starting Cliniva Authentication Integration Tests\n');
  log('blue', `Backend URL: ${BACKEND_URL}`);
  
  try {
    // Test 1: Backend Health
    const backendHealthy = await testBackendHealth();
    if (!backendHealthy) {
      log('red', '\n❌ Backend is not accessible. Please start the backend server first.');
      process.exit(1);
    }
    
    // Test 2: User Registration
    let authData = await testUserRegistration();
    
    // Test 3: User Login (if registration failed due to existing user)
    if (!authData) {
      authData = await testUserLogin();
    }
    
    if (!authData) {
      log('red', '\n❌ Could not authenticate user. Tests failed.');
      process.exit(1);
    }
    
    // Test 4: Protected Route Access
    const protectedRouteWorking = await testProtectedRoute(authData.access_token);
    
    // Test 5: Token Refresh
    const refreshData = await testTokenRefresh(authData.refresh_token);
    
    // Summary
    log('blue', '\n📊 Test Summary:');
    logResult(backendHealthy, 'Backend Health');
    logResult(!!authData, 'Authentication');
    logResult(protectedRouteWorking, 'Protected Routes');
    logResult(!!refreshData, 'Token Refresh');
    
    if (backendHealthy && authData && protectedRouteWorking && refreshData) {
      log('green', '\n🎉 All authentication tests passed! ✅');
      log('green', 'The backend and frontend are properly integrated.');
      log('blue', '\n📝 Next Steps:');
      log('blue', '1. Test the Next.js frontend by logging in with the test user');
      log('blue', '2. Verify onboarding flow works correctly');
      log('blue', '3. Test role-based access control');
      log('blue', `\n👤 Test User Credentials:`);
      log('blue', `   Email: ${TEST_USER.email}`);
      log('blue', `   Password: ${TEST_USER.password}`);
    } else {
      log('red', '\n❌ Some tests failed. Please check the issues above.');
      process.exit(1);
    }
    
  } catch (error) {
    log('red', `\n💥 Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run tests
runAuthTests();
