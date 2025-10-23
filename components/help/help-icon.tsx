'use client'

import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { HelpCircle } from 'lucide-react'

interface HelpIconProps {
  content: string | React.ReactNode
  title?: string
}

export function HelpIcon({ content, title }: HelpIconProps) {
  return (
    <Popover className="relative inline-block">
      {({ open }) => (
        <>
          <Popover.Button
            className="inline-flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 rounded-full transition-colors"
            aria-label="Help information"
          >
            <HelpCircle className="h-5 w-5" />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-50 w-72 px-4 mt-2 transform -translate-x-1/2 left-1/2">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="relative bg-white p-4">
                  {title && (
                    <h4 className="font-semibold text-brand-charcoal mb-2 text-sm">
                      {title}
                    </h4>
                  )}
                  <div className="text-sm text-gray-600">
                    {content}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
