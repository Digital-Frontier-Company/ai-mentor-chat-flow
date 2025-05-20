
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Type for mentor templates from our database
interface MentorTemplate {
  id: string;
  template_id: string;
  display_name: string;
  description_for_user: string;
  category: string;
  icon: string;
}

const Home: React.FC = () => {
  // Fetch mentor templates from the database
  const { data: mentorTemplates, isLoading } = useQuery({
    queryKey: ['mentorTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_templates')
        .select('id, template_id, display_name, description_for_user, category, icon')
        .order('category');
      
      if (error) throw error;
      return data as MentorTemplate[];
    },
  });

  // Group templates by category for display
  const templatesByCategory = React.useMemo(() => {
    if (!mentorTemplates) return {};
    
    return mentorTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, MentorTemplate[]>);
  }, [mentorTemplates]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technology': return 'from-violet-500 to-purple-700';
      case 'business': return 'from-emerald-500 to-teal-700';
      case 'creative': return 'from-pink-500 to-rose-700';
      case 'language': return 'from-blue-500 to-indigo-700';
      case 'education': return 'from-amber-500 to-orange-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-mentor-blue rounded-full filter blur-3xl"></div>
          <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-mentor-purple rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Unlock Your Potential. Design Your Own AI Mentor.
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-zinc-400">
              Stop generic learning. With MakeMentors.io, you craft personalized AI mentors for any subject, skill, or goal. Tailored guidance, 24/7.
            </p>
            <div className="mt-10">
              <Link to="/mentor-selection">
                <Button size="lg" className="bg-gradient-to-r from-mentor-blue to-mentor-purple hover:from-mentor-blue/90 hover:to-mentor-purple/90 text-white px-8 py-6 text-lg rounded-full">
                  Create Your First Mentor Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Your Personalized Learning Journey in <span className="text-mentor-blue">3 Simple Steps</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700 text-center">
              <div className="w-16 h-16 mx-auto bg-mentor-blue/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose or Customize</h3>
              <p className="text-zinc-400">
                Pick from our expert-designed mentor templates or build one from scratch with your unique specifications.
              </p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700 text-center">
              <div className="w-16 h-16 mx-auto bg-mentor-purple/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Define Your Mentor</h3>
              <p className="text-zinc-400">
                Name your mentor, define its expertise, personality, and teaching style. Make it truly yours.
              </p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700 text-center">
              <div className="w-16 h-16 mx-auto bg-mentor-teal/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn & Grow</h3>
              <p className="text-zinc-400">
                Interact with your AI mentor. Ask questions, get explanations, practice concepts, and receive guidance tailored to your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Learn Smarter, <span className="text-mentor-teal">Not Harder</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Truly Personalized",
                description: "Mentors adapt to your learning style, not a one-size-fits-all approach."
              },
              {
                title: "Available 24/7",
                description: "Your mentor is ready whenever inspiration strikes or you hit a roadblock."
              },
              {
                title: "Patient & Non-Judgmental",
                description: "Ask anything, no matter how basic. Learn in a safe, supportive environment."
              },
              {
                title: "Diverse Expertise",
                description: "From coding to creative writing, history to habit-building – create a mentor for any subject."
              },
              {
                title: "You're in Control",
                description: "Shape your learning experience like never before with customizable mentors."
              },
              {
                title: "Continuous Improvement",
                description: "Your mentors evolve and adapt to your growing understanding and changing needs."
              }
            ].map((benefit, index) => (
              <div key={index} className="flex space-x-4 p-6">
                <CheckCircle className="h-6 w-6 text-mentor-teal flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-zinc-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Templates Section */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Meet Some of Our <span className="text-mentor-purple">Mentor Templates</span>
          </h2>
          <p className="text-center text-zinc-400 mb-16 max-w-3xl mx-auto">
            Get started quickly with our pre-configured mentors. Each template is carefully designed 
            to provide expert guidance in their specialized area.
          </p>
          
          {isLoading && (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-mentor-blue border-r-transparent"></div>
              <p className="mt-2 text-zinc-400">Loading mentor templates...</p>
            </div>
          )}
          
          <div className="grid gap-8">
            {Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category} className="mb-10">
                <h3 className="text-2xl font-semibold mb-6 capitalize">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${getCategoryColor(template.category)}`}></div>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-3xl">{template.icon}</span>
                          <span className={`px-2 py-1 text-xs rounded-full bg-opacity-20 ${category === 'technology' ? 'bg-violet-800 text-violet-300' : 
                            category === 'business' ? 'bg-emerald-800 text-emerald-300' :
                            category === 'creative' ? 'bg-rose-800 text-rose-300' :
                            category === 'language' ? 'bg-blue-800 text-blue-300' : 
                            'bg-amber-800 text-amber-300'}`}>
                            {category}
                          </span>
                        </div>
                        <h4 className="text-xl font-semibold mb-2">{template.display_name}</h4>
                        <p className="text-zinc-400 text-sm mb-4">{template.description_for_user}</p>
                        <Link to={`/mentor-selection?template=${template.template_id}`}>
                          <Button className="w-full bg-zinc-700 hover:bg-zinc-600">
                            Use This Template
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/mentor-selection">
              <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                Explore All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-zinc-950 to-zinc-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Revolutionize How You Learn?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Your personalized AI mentor is just a few clicks away. Start building your knowledge and confidence today.
          </p>
          <Link to="/mentor-selection">
            <Button size="lg" className="bg-gradient-to-r from-mentor-blue to-mentor-purple hover:from-mentor-blue/90 hover:to-mentor-purple/90 text-white px-8 py-6 text-lg">
              Sign Up & Create Your Mentor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
