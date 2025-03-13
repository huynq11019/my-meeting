import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Mic,
  MonitorSmartphone,
  Shield,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 h-0.5">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Connect{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Anywhere
                </span>{" "}
                with Anyone
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                High-quality video meetings accessible to everyone. Join or
                start meetings with crystal-clear audio and video.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 h-11">
                <Link href="/meetings">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-auto text-lg"
                  >
                    Start a Meeting
                    <Video className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <div className="flex">
                  <Input
                    placeholder="Enter meeting code"
                    className="rounded-l-lg rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Link href="/meetings">
                    <Button
                      size="lg"
                      className="rounded-l-none bg-gray-800 hover:bg-gray-900 h-full"
                    >
                      Join
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>No downloads required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Free unlimited meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>End-to-end encryption</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-800 p-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-white text-xs">Meeting in progress</div>
                  <div></div>
                </div>
                <div className="aspect-video bg-gray-100 relative">
                  <div className="grid grid-cols-2 gap-2 p-2 h-full">
                    <div className="bg-gray-700 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80"
                        className="w-full h-full object-cover"
                        alt="Person in meeting"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                        <Mic className="w-3 h-3 mr-1" /> Sarah J.
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80"
                        className="w-full h-full object-cover"
                        alt="Person in meeting"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                        <Mic className="w-3 h-3 mr-1" /> Tom B.
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg overflow-hidden relative">
                      <img
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80"
                        className="w-full h-full object-cover"
                        alt="Person in meeting"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                        <Mic className="w-3 h-3 mr-1 text-red-500" /> Anna K.
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg overflow-hidden relative">
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold mb-2">
                            MJ
                          </div>
                          <div className="text-sm">Mike Johnson</div>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                        <Mic className="w-3 h-3 mr-1" /> Mike J.
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 rounded-full px-4 py-2 flex space-x-4">
                    <button className="text-white p-2 rounded-full bg-red-500 hover:bg-red-600">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button className="text-white p-2 rounded-full bg-red-500 hover:bg-red-600">
                      <Camera className="w-5 h-5" />
                    </button>
                    <button className="text-white p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                      <MonitorSmartphone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose Our Video Platform
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing the way teams connect with cutting-edge
              technology and unparalleled video quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Lightning Fast",
                description: "Low-latency video for smooth conversations",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Enterprise Security",
                description: "End-to-end encryption built-in",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Team Collaboration",
                description: "Screen sharing and interactive tools",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "99.9% Uptime",
                description: "Reliability you can count on",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-blue-100">Daily Meetings</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Countries & Regions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Guaranteed</div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Meeting?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who trust our platform for their video
            conferencing needs.
          </p>
          <Link
            href="/meetings"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start a Free Meeting
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
