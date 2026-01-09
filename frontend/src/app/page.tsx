'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Folder,
  Monitor,
  FileText,
  Router,
  Cpu,
  HardDrive,
  Activity,
  Network,
  Play,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Timer,
  Cloud,
  History,
  ExternalLink,
  TrendingUp,
  Server,
  Zap,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/get-started')
    }
  }, [isAuthenticated, isLoading, router])

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const quickStats = [
    { label: 'Active Workspaces', value: '8', change: '+2', trend: 'up', icon: Folder, href: '/workspace' },
    { label: 'Running VMs', value: '23', change: '+5', trend: 'up', icon: Monitor, href: '/data-center/vmtemplates' },
    { label: 'Active Runbooks', value: '3', change: '+1', trend: 'up', icon: FileText, href: '/runbooks' },
    { label: 'Workstations', value: '45', change: '+8', trend: 'up', icon: Server, href: '/data-center/workstations' },
  ]

  const infrastructureMetrics = [
    { label: 'CPU Usage', value: 68, icon: Cpu, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Memory', value: 72, icon: HardDrive, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Storage', value: 45, icon: HardDrive, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Network', value: 38, icon: Network, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  ]

  const activeWorkspaces = [
    {
      id: 'ws-ai-research-001',
      name: 'Palet QC System',
      type: 'AI Research',
      ttlHours: 672,
      team: 4,
      vms: 3,
      status: 'running',
      tags: ['production', 'ai', 'manufacturing']
    },
    {
      id: 'ws-network-001',
      name: 'Industrial Network Setup',
      type: 'Network Security',
      ttlHours: 168,
      team: 2,
      vms: 5,
      status: 'running',
      tags: ['security', 'network', 'it-ot']
    },
    {
      id: 'ws-dev-003',
      name: 'Edge Computing Test',
      type: 'Development',
      ttlHours: 48,
      team: 3,
      vms: 2,
      status: 'warning',
      tags: ['development', 'edge', 'iot']
    }
  ]

  const runningRunbooks = [
    {
      id: 'run-001',
      title: 'Palet Defect Detection System',
      progress: 67,
      currentStep: 'Deploy AI Processing VM',
      executor: 'Alice Wilson',
      eta: '15 min'
    },
    {
      id: 'run-002',
      title: 'IT/OT Network Segmentation',
      progress: 89,
      currentStep: 'Configure Security Policies',
      executor: 'Bob Martinez',
      eta: '5 min'
    }
  ]

  const recentActivity = [
    {
      action: 'Runbook "Build Success" completed successfully',
      time: mounted ? new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString() : '2 min ago',
      type: 'success',
      icon: CheckCircle2,
      link: '/runbooks'
    },
    {
      action: 'Workspace "AI Research" TTL extended to 30 days',
      time: mounted ? new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString() : '15 min ago',
      type: 'info',
      icon: Clock,
      link: '/workspace/ws-ai-research-001'
    },
    {
      action: 'New workstation assigned to Industrial Network',
      time: mounted ? new Date(Date.now() - 60 * 60 * 1000).toLocaleTimeString() : '1 hour ago',
      type: 'info',
      icon: Router,
      link: '/data-center/workstations'
    },
    {
      action: 'Infrastructure update: Proxmox VE upgraded',
      time: mounted ? new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString() : '2 hours ago',
      type: 'success',
      icon: Cloud,
      link: '/data-center/testbed'
    },
    {
      action: 'API key "Production API" expires in 7 days',
      time: mounted ? new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleTimeString() : '3 hours ago',
      type: 'warning',
      icon: AlertCircle,
      link: '/user'
    }
  ]

  const quickActions = [
    {
      title: 'Execute Runbook',
      description: 'Deploy with automated templates',
      href: '/runbooks',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Create Workspace',
      description: 'Start a new project environment',
      href: '/workspace',
      icon: Folder,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Deploy VM Template',
      description: 'Launch preconfigured systems',
      href: '/data-center/vmtemplates',
      icon: Monitor,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Monitor Infrastructure',
      description: 'View system health and metrics',
      href: '/data-center/testbed',
      icon: BarChart3,
      gradient: 'from-amber-500 to-amber-600'
    },
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'destructive'
      default: return 'secondary'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-amber-500'
      case 'error': return 'text-red-500'
      default: return 'text-blue-500'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive overview of your infrastructure, workspaces, and automated deployments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">{stat.change}</span>
                  <span className="text-sm text-muted-foreground ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Runbooks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Play className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Active Runbooks</CardTitle>
                  <CardDescription>Currently executing automations</CardDescription>
                </div>
              </div>
              <Badge variant="warning">{runningRunbooks.length} running</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningRunbooks.map((runbook) => (
              <div key={runbook.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{runbook.title}</h4>
                    <p className="text-sm text-muted-foreground">{runbook.currentStep}</p>
                  </div>
                  <Badge variant="warning">{runbook.progress}%</Badge>
                </div>
                <Progress value={runbook.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{runbook.executor.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{runbook.executor}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>ETA: {runbook.eta}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/runbooks">
                View All Runbooks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Infrastructure Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Infrastructure Health</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {infrastructureMetrics.map((metric, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", metric.bgColor)}>
                      <metric.icon className={cn("h-5 w-5", metric.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className={cn("text-2xl font-bold", metric.color)}>{metric.value}%</p>
                    </div>
                  </div>
                  <Progress
                    value={metric.value}
                    className="h-2"
                    indicatorClassName={cn(
                      metric.value > 80 ? "bg-red-500" :
                      metric.value > 60 ? "bg-amber-500" : "bg-green-500"
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/data-center/testbed">
                View Detailed Metrics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Active Workspaces Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Active Workspaces</CardTitle>
              <CardDescription>Your running project environments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>TTL</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>VMs</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeWorkspaces.map((workspace) => (
                <TableRow key={workspace.id} className="group">
                  <TableCell>
                    <span className="font-medium">{workspace.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{workspace.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(workspace.ttlHours / 24)}d {workspace.ttlHours % 24}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{workspace.team}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Monitor className="h-4 w-4" />
                      <span>{workspace.vms}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {workspace.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workspace.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{workspace.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(workspace.status)}>
                      {workspace.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/workspace/${workspace.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Workspace</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/workspace">
              View All Workspaces
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                      action.gradient
                    )} />
                    <div className="relative">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br text-white",
                        action.gradient
                      )}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold mb-1">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <History className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-1">
                {recentActivity.map((activity, index) => (
                  <Link key={index} href={activity.link}>
                    <div className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 cursor-pointer">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        activity.type === 'success' ? 'bg-green-500/10' :
                        activity.type === 'warning' ? 'bg-amber-500/10' :
                        activity.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      )}>
                        <activity.icon className={cn("h-4 w-4", getActivityIcon(activity.type))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              View Full Activity Log
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
