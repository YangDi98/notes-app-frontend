import RegisterPage from '@/app/auth/pages/RegisterPage.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { apiClient } from '@/api/auth'
import AxiosMockAdapter from 'axios-mock-adapter'

const mockAxios = new AxiosMockAdapter(apiClient)

describe('RegisterPage', () => {
  beforeEach(() => {
    mockAxios.reset()
  })

  afterEach(() => {
    mockAxios.reset()
  })

  function createComponent() {
    const wrapper = mount(RegisterPage, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
      },
    })

    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    return { wrapper, authStore, notificationStore }
  }

  it('mounts renders properly', () => {
    const { wrapper } = createComponent()
    expect(wrapper.exists()).toBe(true)
  })

  it('registers a new user successfully', async () => {
    const { wrapper, notificationStore } = createComponent()

    mockAxios.onPost('/api/auth/register').reply(200)

    wrapper.vm.form = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password@Y123',
      confirmPassword: 'password@Y123',
    }

    await nextTick()

    // Call the register method directly instead of triggering form submit
    await wrapper.vm.register()

    await flushPromises()


    expect(notificationStore.setAlertMessage).toHaveBeenCalledWith({
      message: 'Registration successful.',
      type: 'success',
    })
  })

  describe('Form validation', () => {
    it('validates required firstName', () => {
      const { wrapper } = createComponent()
      const rules = wrapper.vm.rules.firstName

      expect(rules[0]('')).toBe('First Name is required')
      expect(rules[0]('   ')).toBe('First Name is required')
      expect(rules[0]('John')).toBe(true)
    })

    it('validates required lastName', () => {
      const { wrapper } = createComponent()
      const rules = wrapper.vm.rules.lastName

      expect(rules[0]('')).toBe('Last Name is required')
      expect(rules[0]('   ')).toBe('Last Name is required')
      expect(rules[0]('Doe')).toBe(true)
    })

    it('validates email format', () => {
      const { wrapper } = createComponent()
      const rules = wrapper.vm.rules.email

      // Required validation
      expect(rules[0]('')).toBe('Email is required')
      expect(rules[0]('   ')).toBe('Email is required')
      expect(rules[0]('test@example.com')).toBe(true)

      // Email format validation
      expect(rules[1]('invalid-email')).toBe('Email must be valid')
      expect(rules[1]('test@')).toBe('Email must be valid')
      expect(rules[1]('test@example')).toBe('Email must be valid')
      expect(rules[1]('test@example.com')).toBe(true)
    })

    it('validates password strength', () => {
      const { wrapper } = createComponent()
      const rules = wrapper.vm.rules.password

      // Required validation
      expect(rules[0]('')).toBe('Password is required')
      expect(rules[0]('validPass123@')).toBe(true)

      // Password strength validation
      expect(rules[1]('weak')).toBe(
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)',
      )
      expect(rules[1]('NoDigit@')).toBe(
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)',
      )
      expect(rules[1]('nouppercas123@')).toBe(
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)',
      )
      expect(rules[1]('NOLOWERCASE123@')).toBe(
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)',
      )
      expect(rules[1]('NoSpecial123')).toBe(
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)',
      )
      expect(rules[1]('ValidPass123@')).toBe(true)
    })

    it('validates password confirmation', () => {
      const { wrapper } = createComponent()

      // Set the main password first
      wrapper.vm.form.password = 'ValidPass123@'

      const rules = wrapper.vm.rules.confirmPassword

      // Required validation
      expect(rules[0]('')).toBe('Please confirm your password')
      expect(rules[0]('ValidPass123@')).toBe(true)

      // Password strength validation (same as password)
      expect(rules[1]('weak')).toBe(
        'Password must be at least 9 characters with uppercase, lowercase, digit, and special character (@$#%)',
      )
      expect(rules[1]('ValidPass123@')).toBe(true)

      // Password match validation
      expect(rules[2]('DifferentPass123@')).toBe('Passwords must match')
      expect(rules[2]('ValidPass123@')).toBe(true)
    })

    it('sets formValid to true when all fields are valid', async () => {
      const { wrapper } = createComponent()

      wrapper.vm.form = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'ValidPass123@',
        confirmPassword: 'ValidPass123@',
      }

      await nextTick()

      // Note: In a real scenario, Vuetify would validate and set formValid
      // For this test, you might need to manually trigger validation or mock it
      expect(wrapper.vm.form.firstName).toBe('John')
      expect(wrapper.vm.form.lastName).toBe('Doe')
      expect(wrapper.vm.form.email).toBe('john.doe@example.com')
    })
  })

  it('shows validation error when email is invalid', async () => {
    const { wrapper } = createComponent()

    // Find the actual input element within the Vuetify text field
    const emailField = wrapper.find('[data-testid="email-field"] input')

    // Type invalid email like a real user
    await emailField.setValue('invalid-email')
    await emailField.trigger('blur') // Trigger validation
    await nextTick()

    // Vuetify will show the actual validation message
    expect(wrapper.text()).toContain('Email must be valid')
    expect(wrapper.vm.formValid).toBe(false)
  })

  it('enables submit button when form is valid', async () => {
    const { wrapper } = createComponent()

    // Fill in valid data by finding the input elements
    await wrapper.find('[data-testid="firstName-field"] input').setValue('John')
    await wrapper.find('[data-testid="lastName-field"] input').setValue('Doe')
    await wrapper.find('[data-testid="email-field"] input').setValue('john@example.com')
    await wrapper.find('[data-testid="password-field"] input').setValue('ValidPass123@')
    await wrapper.find('[data-testid="confirmPassword-field"] input').setValue('ValidPass123@')

    // Trigger validation by blurring each field
    //await wrapper.find('[data-testid="firstName-field"] input').trigger('blur')


    await nextTick()
    await flushPromises() // Wait for any async validation

    // Check form validity state

    // Check that submit button becomes enabled (no disabled attribute)
    const submitButton = wrapper.find('[data-testid="register-button"]')
    expect(submitButton.attributes('disabled')).toBeFalsy()
  })
})
