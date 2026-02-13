"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ImageModal } from "@/components/image-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function ExamplesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const examples = [
    {
      title: "Personal Finance Guide for Teens",
      description: "A comprehensive guide covering budgeting, saving, investing, and financial planning for teenagers.",
      image: "/examples/personal-finance-teens.png",
      category: "Education",
      tags: ["Finance", "Education", "Planning"],
    },
    {
      title: "Atomic Habits Book Summary",
      description: "Key concepts from James Clear's bestselling book on building good habits and breaking bad ones.",
      image: "/examples/atomic-habits.png",
      category: "Self-Development",
      tags: ["Habits", "Psychology", "Self-Improvement"],
    },
    {
      title: "How Airlines Make Money",
      description:
        "Business model analysis showing revenue streams, cost management, and strategic factors in aviation.",
      image: "/examples/airline-revenue.png",
      category: "Business",
      tags: ["Business Model", "Aviation", "Revenue"],
    },
    {
      title: "Pricing Psychology Strategies",
      description: "Psychological pricing tactics that influence consumer behavior and purchasing decisions.",
      image: "/examples/pricing-psychology.png",
      category: "Marketing",
      tags: ["Psychology", "Pricing", "Marketing"],
    },
    {
      title: "Top Scientists by Era",
      description:
        "Historical overview of influential scientists and their contributions across different time periods.",
      image: "/examples/top-scientists.png",
      category: "Education",
      tags: ["History", "Science", "Timeline"],
    },
    {
      title: "Madrid Travel Planning",
      description: "Complete travel guide for visiting Madrid, including accommodation, activities, and cultural tips.",
      image: "/examples/madrid-travel.png",
      category: "Travel",
      tags: ["Travel", "Spain", "Planning"],
    },
    {
      title: "Career Development Tips",
      description: "Professional growth strategies covering networking, skills, interviews, and career advancement.",
      image: "/examples/career-tips.png",
      category: "Professional",
      tags: ["Career", "Professional", "Growth"],
    },
    {
      title: "Website Development Project",
      description: "Project management framework for planning and executing web development projects.",
      image: "/examples/website-development.png",
      category: "Technology",
      tags: ["Web Development", "Project Management", "Technology"],
    },
    {
      title: "Nutrition Expertise Guide",
      description: "Comprehensive overview of nutrition science, dietary guidelines, and healthy eating practices.",
      image: "/examples/nutrition-expertise.png",
      category: "Health",
      tags: ["Nutrition", "Health", "Science"],
    },
    {
      title: "Smart Seasonal Tips to Save Money",
      description:
        "Year-round money-saving strategies organized by seasons, covering heating, shopping, travel, and financial planning.",
      image: "/examples/smart-seasonal-tips-save-money.png",
      category: "Education",
      tags: ["Finance", "Seasonal", "Money-Saving"],
    },
    {
      title: "Travel with Kids in the US",
      description:
        "Family travel planning guide for both low and high budgets, including destinations, accommodations, and activities.",
      image: "/examples/travel-with-kids-us-budgets.png",
      category: "Travel",
      tags: ["Family Travel", "Budget Planning", "USA"],
    },
    {
      title: "ICE vs Electric Motors Comparison",
      description:
        "Technical analysis comparing internal combustion engines and electric motors across efficiency, cost, and performance.",
      image: "/examples/ice-vs-electric-motors.png",
      category: "Technology",
      tags: ["Automotive", "Electric Vehicles", "Engineering"],
    },
    {
      title: "Mastering Self-Discipline and Focus",
      description:
        "Comprehensive guide to developing self-discipline, focus techniques, habit building, and overcoming procrastination.",
      image: "/examples/mastering-self-discipline-focus.png",
      category: "Self-Development",
      tags: ["Self-Discipline", "Focus", "Productivity"],
    },
    {
      title: "Biology Branches Overview",
      description:
        "Educational overview of major biology disciplines including botany, zoology, genetics, and molecular biology.",
      image: "/examples/biology-branches.png",
      category: "Education",
      tags: ["Biology", "Science", "Academic"],
    },
    {
      title: "Mental Models for Decision-Making",
      description:
        "Framework of cognitive tools and models for better decision-making in business and personal contexts.",
      image: "/examples/mental-models-decision-making.png",
      category: "Professional",
      tags: ["Decision Making", "Mental Models", "Strategy"],
    },
    {
      title: "Primary School Preparation Checklist",
      description: "Complete preparation guide for parents getting their children ready for primary school.",
      image: "/examples/prep-for-primary-school.png",
      category: "Education",
      tags: ["Education", "Parenting", "School Preparation"],
    },
    {
      title: "Bank Interest Rate Policies Impact",
      description:
        "Analysis of how interest rate policies affect banks' net income through various direct and indirect channels.",
      image: "/examples/bank-interest-rate-policies.png",
      category: "Business",
      tags: ["Banking", "Interest Rates", "Financial Analysis"],
    },
  ]

  const categories = [
    "All",
    "Education",
    "Business",
    "Marketing",
    "Travel",
    "Professional",
    "Technology",
    "Health",
    "Self-Development",
  ]

  const filteredExamples =
    selectedCategory === "All" ? examples : examples.filter((example) => example.category === selectedCategory)

  // Prepare images for modal
  const modalImages = filteredExamples.map((example) => ({
    src: example.image,
    alt: example.title,
    title: example.title,
  }))

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Use Case Examples</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Click on any image to view it in detail. Generate your own ones in seconds.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Examples Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExamples.map((example, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="aspect-video relative bg-muted cursor-pointer group"
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={example.image || "/placeholder.svg"}
                  alt={example.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/90 px-3 py-1 rounded-full text-sm font-medium">
                    Click to explore
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight">{example.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {example.category}
                  </Badge>
                </div>
                <CardDescription className="text-sm">{example.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {example.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExamples.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No examples found for the selected category.</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-primary/10 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Inspired by These Examples?</h3>
          <p className="text-muted-foreground mb-4">
            Create your own mind map using any of these topics as inspiration, or start with something completely new.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Creating →
          </a>
        </div>
      </main>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={modalImages}
        currentIndex={currentImageIndex}
        onNavigate={setCurrentImageIndex}
      />
    </div>
  )
}
