'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { X, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'

interface OnboardingFlowProps {
  userId: string
  onComplete?: () => void
}

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    profession: '',
    otherProfession: '',
    useCases: [] as string[],
    otherUseCase: '',
    referralSource: ''
  })

  const supabase = createClient()

  useEffect(() => {
    async function checkOnboarding() {
      const { data } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle()

      const dismissed = localStorage.getItem('onboarding_dismissed_session')
      if (!data?.onboarding_completed && !dismissed) {
        setTimeout(() => setIsOpen(true), 500)
      }
    }
    checkOnboarding()
  }, [userId, supabase])

  const handleComplete = async () => {
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      profession_type: formData.profession === 'Other' ? formData.otherProfession : formData.profession,
      primary_use_case: formData.useCases.includes('Other')
        ? [...formData.useCases.filter(u => u !== 'Other'), formData.otherUseCase]
        : formData.useCases,
      referral_source: formData.referralSource,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString()
    })

    setIsOpen(false)
    localStorage.removeItem('onboarding_dismissed_session')
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_dismissed_session', 'true')
    setIsOpen(false)
  }

  const canProceed = () => {
    switch(currentStep) {
      case 1:
        return formData.profession !== '' && (formData.profession !== 'Other' || formData.otherProfession !== '')
      case 2:
        return formData.useCases.length > 0 && (!formData.useCases.includes('Other') || formData.otherUseCase !== '')
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all relative">
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  aria-label="Close onboarding"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                        step <= currentStep ? 'bg-brand-green' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <Step1
                      key="step1"
                      formData={formData}
                      setFormData={setFormData}
                      onNext={() => setCurrentStep(2)}
                      onSkip={handleSkip}
                      canProceed={canProceed()}
                    />
                  )}
                  {currentStep === 2 && (
                    <Step2
                      key="step2"
                      formData={formData}
                      setFormData={setFormData}
                      onNext={() => setCurrentStep(3)}
                      onBack={() => setCurrentStep(1)}
                      onSkip={handleSkip}
                      canProceed={canProceed()}
                    />
                  )}
                  {currentStep === 3 && (
                    <Step3
                      key="step3"
                      formData={formData}
                      setFormData={setFormData}
                      onComplete={handleComplete}
                      onBack={() => setCurrentStep(2)}
                      onSkip={handleSkip}
                    />
                  )}
                </AnimatePresence>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

function Step1({ formData, setFormData, onNext, onSkip, canProceed }: any) {
  const professions = [
    'Freelancer / Independent Contractor',
    'Small Business Owner (1-5 employees)',
    'Agency / Consultancy',
    'Other'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-white" />
        </div>
        <Dialog.Title className="text-2xl font-bold text-brand-charcoal mb-2">
          Welcome to TradeTimer!
        </Dialog.Title>
        <p className="text-gray-600 text-sm">
          Let's personalize your experience in 3 quick steps
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <label className="block font-medium text-brand-charcoal text-sm mb-2">
          What best describes what you do?
        </label>

        {professions.map((option) => (
          <label
            key={option}
            className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.profession === option
                ? 'border-brand-green bg-brand-green/5'
                : 'border-gray-200 hover:border-brand-green/30'
            }`}
          >
            <input
              type="radio"
              name="profession"
              value={option}
              checked={formData.profession === option}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="mt-0.5 mr-3 text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm text-brand-charcoal">{option}</span>
          </label>
        ))}

        {formData.profession === 'Other' && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="text"
            placeholder="Please specify..."
            value={formData.otherProfession}
            onChange={(e) => setFormData({ ...formData, otherProfession: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 px-4 py-2.5 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

function Step2({ formData, setFormData, onNext, onBack, onSkip, canProceed }: any) {
  const useCases = [
    'Track billable hours for client invoicing',
    'Monitor project profitability',
    'Improve personal productivity',
    'Manage team time tracking',
    'Other'
  ]

  const toggleUseCase = (useCase: string) => {
    const newUseCases = formData.useCases.includes(useCase)
      ? formData.useCases.filter((uc: string) => uc !== useCase)
      : [...formData.useCases, useCase]

    setFormData({ ...formData, useCases: newUseCases })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <div className="text-xs text-brand-green font-medium mb-2">STEP 2 OF 3</div>
        <Dialog.Title className="text-2xl font-bold text-brand-charcoal mb-2">
          What's your main goal?
        </Dialog.Title>
        <p className="text-gray-600 text-sm">
          Select all that apply - this helps us show you relevant features
        </p>
      </div>

      <div className="space-y-2.5 mb-6">
        {useCases.map((useCase) => (
          <label
            key={useCase}
            className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.useCases.includes(useCase)
                ? 'border-brand-green bg-brand-green/5'
                : 'border-gray-200 hover:border-brand-green/30'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.useCases.includes(useCase)}
              onChange={() => toggleUseCase(useCase)}
              className="mt-0.5 mr-3 rounded text-brand-green focus:ring-brand-green"
            />
            <span className="text-sm text-brand-charcoal">{useCase}</span>
          </label>
        ))}

        {formData.useCases.includes('Other') && (
          <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="text"
            placeholder="Please describe..."
            value={formData.otherUseCase}
            onChange={(e) => setFormData({ ...formData, otherUseCase: e.target.value })}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 px-4 py-2.5 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

function Step3({ formData, setFormData, onComplete, onBack, onSkip }: any) {
  const referralSources = [
    'Google search',
    'Social media (LinkedIn, Twitter, etc.)',
    'Friend or colleague recommendation',
    'Blog post or article',
    'YouTube or podcast',
    'Product Hunt or similar directory',
    'Other',
    'Prefer not to say'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <div className="text-xs text-brand-green font-medium mb-2">FINAL STEP</div>
        <Dialog.Title className="text-2xl font-bold text-brand-charcoal mb-2">
          One last thing!
        </Dialog.Title>
        <p className="text-gray-600 text-sm">
          How did you hear about TradeTimer? (Optional)
        </p>
      </div>

      <div className="mb-6">
        <select
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-green focus:outline-none text-sm transition-colors"
          value={formData.referralSource}
          onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
        >
          <option value="">Select an option...</option>
          {referralSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gradient-to-br from-brand-green/10 to-brand-sky/10 rounded-lg p-4 mb-6 border border-brand-green/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-brand-charcoal text-sm mb-1">
              Pro Tip: Get Started in 3 Steps
            </h4>
            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
              <li>Add your first client with their hourly rate</li>
              <li>Select them from the timer dropdown</li>
              <li>Click "Start Timer" to begin tracking!</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onComplete}
          className="flex-1 px-4 py-2.5 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          Get Started!
          <CheckCircle className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
