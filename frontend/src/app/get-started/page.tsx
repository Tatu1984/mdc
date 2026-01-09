'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Server,
  Folder,
  Monitor,
  FileText,
  Rocket,
  ArrowRight,
  CheckCircle,
  Loader2,
  LogIn,
  Shield,
  Zap,
  Users,
  Globe,
  Cpu,
  HardDrive,
  Activity,
  Play,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function GetStartedPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // If authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSignIn = () => {
    login()
  }

  const concepts = [
    {
      title: "Workspaces",
      description: "Isolated environments for organizing projects with complete separation and access control.",
      icon: Folder,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/25",
    },
    {
      title: "Virtual Machines",
      description: "Scalable compute resources running any OS with instant provisioning and snapshots.",
      icon: Monitor,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/25",
    },
    {
      title: "Workstations",
      description: "Pre-configured development environments with GPU support and remote access.",
      icon: Cpu,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/25",
    },
    {
      title: "Runbooks",
      description: "Automated procedures for deployments, troubleshooting, and maintenance tasks.",
      icon: FileText,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
    }
  ]

  const stats = [
    { value: "99.9%", label: "Uptime SLA", icon: Activity },
    { value: "< 30s", label: "VM Deploy Time", icon: Zap },
    { value: "256-bit", label: "Encryption", icon: Shield },
    { value: "24/7", label: "Monitoring", icon: Globe },
  ]

  const features = [
    { icon: Shield, text: "Enterprise Security", description: "SOC2 compliant infrastructure" },
    { icon: Zap, text: "Instant Deployment", description: "VMs ready in seconds" },
    { icon: Users, text: "Team Collaboration", description: "Role-based access control" },
    { icon: HardDrive, text: "Persistent Storage", description: "High-performance SSDs" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Floating Particles */}
        <div className="absolute top-20 left-[20%] w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60" />
        <div className="absolute top-40 right-[30%] w-1.5 h-1.5 bg-violet-400 rounded-full animate-float delay-500 opacity-60" />
        <div className="absolute bottom-40 left-[40%] w-2 h-2 bg-cyan-400 rounded-full animate-float delay-1000 opacity-60" />
        <div className="absolute top-60 right-[15%] w-1 h-1 bg-emerald-400 rounded-full animate-float delay-700 opacity-60" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-sm opacity-75" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Server className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">MicroDataCluster</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">Infrastructure Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Features
            </Button>
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container py-24 md:py-32">
        <div className={cn(
          "max-w-5xl mx-auto text-center space-y-8 transition-all duration-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">Next-Gen Infrastructure Management</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-white">Build & Scale Your</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Infrastructure
            </span>
            <br />
            <span className="text-white">with Confidence</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            The complete platform for managing development environments, virtual machines,
            and automated workflows. <span className="text-slate-300">Deploy in seconds, scale without limits.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              onClick={handleSignIn}
              disabled={isLoading}
              className="text-lg px-8 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/40 hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-5 w-5" />
              )}
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-14 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-12 text-sm">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-400">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                  <feature.icon className="h-4 w-4 text-cyan-400" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Dashboard Preview */}
        <div className={cn(
          "max-w-4xl mx-auto mt-20 transition-all duration-1000 delay-300",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-violet-500/20 rounded-3xl blur-2xl" />

            {/* Dashboard Card */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 p-1 shadow-2xl">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-lg bg-slate-800/50 text-xs text-slate-400 font-mono">
                    app.microdatacluster.io/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content Preview */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" />
                    <div>
                      <div className="h-3 w-24 bg-slate-700 rounded" />
                      <div className="h-2 w-16 bg-slate-800 rounded mt-1" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                      <span className="text-xs text-emerald-400">● Active</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="h-2 w-8 bg-slate-600 rounded mb-2" />
                      <div className="h-6 w-12 bg-gradient-to-r from-blue-500/50 to-cyan-500/50 rounded" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 h-24 rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                    <div className="flex items-end justify-between h-full">
                      {[40, 65, 45, 80, 55, 70, 85].map((h, i) => (
                        <div key={i} className="w-6 rounded-t bg-gradient-to-t from-blue-500 to-cyan-500" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="w-32 h-24 rounded-xl bg-slate-800/30 border border-slate-700/50 p-4 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative container py-16 border-y border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "text-center transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 mb-3">
                <stat.icon className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative container py-24">
        <div className={cn(
          "text-center mb-16 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Badge className="mb-4 bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20">
            Core Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful tools designed for modern infrastructure management
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {concepts.map((concept, index) => (
            <Card
              key={concept.title}
              className={cn(
                "group relative bg-slate-900/50 border-slate-700/50 overflow-hidden transition-all duration-500 hover:border-slate-600/50 cursor-pointer",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                activeFeature === index && "border-slate-500/50 shadow-xl"
              )}
              style={{ transitionDelay: `${800 + index * 100}ms` }}
              onClick={() => setActiveFeature(index)}
            >
              {/* Hover Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                concept.gradient
              )} />

              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "relative p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                    concept.gradient,
                    concept.shadowColor
                  )}>
                    <concept.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-white group-hover:text-cyan-300 transition-colors">
                      {concept.title}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-400 mt-2 leading-relaxed">
                      {concept.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>

              {/* Active Indicator */}
              {activeFeature === index && (
                <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", concept.gradient)} />
              )}
            </Card>
          ))}
        </div>

        {/* Feature Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 text-center transition-all duration-500 hover:bg-slate-900/50 hover:border-slate-700/50",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${1000 + index * 100}ms` }}
            >
              <feature.icon className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
              <div className="font-medium text-white text-sm">{feature.text}</div>
              <div className="text-xs text-slate-500 mt-1">{feature.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative container py-24">
        <div className={cn(
          "max-w-4xl mx-auto transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-violet-600/20 rounded-3xl blur-3xl" />

            <Card className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700/50 overflow-hidden">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

              <CardContent className="relative py-16 px-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl shadow-cyan-500/30 mb-6">
                  <Rocket className="h-8 w-8 text-white" />
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Ready to Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Infrastructure?
                  </span>
                </h2>

                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                  Join teams who trust MicroDataCluster for their development and testing infrastructure.
                  Start building today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="text-lg px-10 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-xl shadow-cyan-500/30 transition-all hover:shadow-cyan-500/40 hover:scale-105"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-5 w-5" />
                    )}
                    Get Started Now
                  </Button>
                </div>

                <p className="text-sm text-slate-500 mt-6">
                  <CheckCircle className="inline h-4 w-4 text-emerald-500 mr-1" />
                  No credit card required • Free tier available
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 bg-slate-950/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Server className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">MicroDataCluster</span>
                <p className="text-xs text-slate-500">Infrastructure Management Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>© 2024 MicroDataCluster</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Built for developers, by developers</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}
