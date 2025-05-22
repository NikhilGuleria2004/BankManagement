import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRightIcon, ShieldCheckIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      name: 'Secure Banking',
      description: 'Your security is our top priority. We use advanced encryption to protect your data.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Easy Payments',
      description: 'Make payments and transfers with just a few clicks. Fast, secure, and reliable.',
      icon: CreditCardIcon,
    },
    {
      name: 'Financial Insights',
      description: 'Get detailed insights into your spending habits and financial health.',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero section */}
      <div className="relative bg-primary-600 w-full">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Banking"
          />
          <div className="absolute inset-0 bg-primary-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Modern Banking for Everyone
          </h1>
          <p className="mt-6 text-xl text-primary-100 max-w-3xl">
            Experience banking like never before. Secure, fast, and designed for your convenience.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
              >
                Go to Dashboard
                <ArrowRightIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50"
              >
                Get Started
                <ArrowRightIcon className="ml-3 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for modern banking
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the tools you need to manage your finances effectively.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-700 w-full">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-200">Join thousands of satisfied customers today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 