/**
 * MSG91 OTP Service
 * API Documentation: https://docs.msg91.com/p/tf95n6be8/v/5/
 */

const AUTH_KEY = import.meta.env.VITE_MSG91_AUTH_KEY
const SENDER_ID = import.meta.env.VITE_MSG91_SENDER_ID
const TEMPLATE_ID = import.meta.env.VITE_MSG91_TEMPLATE_ID

export const msg91 = {
  /**
   * Send OTP to a phone number
   * @param {string} phone - 10 digit phone number
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendOTP(phone) {
    try {
      const response = await fetch(`https://api.msg91.com/api/v5/otp?template_id=${TEMPLATE_ID}&mobile=91${phone}&authkey=${AUTH_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      
      if (data.type === 'success') {
        return { success: true, message: 'OTP sent successfully' }
      } else {
        throw new Error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('MSG91 Send Error:', error)
      return { success: false, message: error.message }
    }
  },

  /**
   * Verify OTP
   * @param {string} phone - 10 digit phone number
   * @param {string} otp - 6 digit OTP
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifyOTP(phone, otp) {
    try {
      const response = await fetch(`https://api.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}&authkey=${AUTH_KEY}`, {
        method: 'GET'
      })
      const data = await response.json()

      if (data.type === 'success') {
        return { success: true, message: 'OTP verified' }
      } else {
        throw new Error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('MSG91 Verify Error:', error)
      return { success: false, message: error.message }
    }
  },

  /**
   * Verify Access Token from OTP Widget
   * @param {string} accessToken - JWT from widget
   * @returns {Promise<{success: boolean, data: any}>}
   */
  async verifyAccessToken(accessToken) {
    try {
      const response = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          authkey: AUTH_KEY,
          'access-token': accessToken
        })
      })
      const data = await response.json()
      return { success: data.type === 'success', data }
    } catch (error) {
      console.error('MSG91 Widget Verify Error:', error)
      return { success: false, data: error }
    }
  },

  /**
   * Resend OTP
   * @param {string} phone - 10 digit phone number
   */
  async resendOTP(phone) {
    try {
      const response = await fetch(`https://api.msg91.com/api/v5/otp/retry?retrytype=text&mobile=91${phone}&authkey=${AUTH_KEY}`, {
        method: 'GET'
      })
      const data = await response.json()
      return data.type === 'success'
    } catch (error) {
      console.error('MSG91 Resend Error:', error)
      return false
    }
  }
}
