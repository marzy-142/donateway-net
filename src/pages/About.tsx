
import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Heart, Users, MapPin, Calendar, Droplet } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <section className="bg-bloodlink-pink py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4">About BloodLink</h1>
            <p className="text-lg text-gray-600">
              Connecting donors, recipients, and hospitals to save lives through efficient blood donation management.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-bloodlink-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-bloodlink-red" />
                </div>
                <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To facilitate timely and efficient blood donations, connecting those in need with willing donors.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-bloodlink-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-bloodlink-red" />
                </div>
                <h3 className="text-xl font-bold mb-2">Our Community</h3>
                <p className="text-gray-600">
                  A growing network of donors, recipients, medical facilities, and volunteers working together.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-bloodlink-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-bloodlink-red" />
                </div>
                <h3 className="text-xl font-bold mb-2">Our Reach</h3>
                <p className="text-gray-600">
                  Serving communities across the country with an expanding network of medical facilities.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-16 w-16 bg-bloodlink-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-bloodlink-red" />
                </div>
                <h3 className="text-xl font-bold mb-2">Our History</h3>
                <p className="text-gray-600">
                  Founded in 2023 with a vision to revolutionize blood donation management through technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Blood Donation Matters</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-bloodlink-red/10 rounded-full flex items-center justify-center mt-1 shrink-0">
                    <Droplet className="h-4 w-4 text-bloodlink-red" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Save Lives</h3>
                    <p className="text-gray-600">
                      A single donation can save up to three lives, helping accident victims, surgery patients, and those with chronic illnesses.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-bloodlink-red/10 rounded-full flex items-center justify-center mt-1 shrink-0">
                    <Droplet className="h-4 w-4 text-bloodlink-red" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Constant Need</h3>
                    <p className="text-gray-600">
                      Every two seconds, someone needs blood. It's a continuous necessity that requires regular donations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-bloodlink-red/10 rounded-full flex items-center justify-center mt-1 shrink-0">
                    <Droplet className="h-4 w-4 text-bloodlink-red" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Short Shelf Life</h3>
                    <p className="text-gray-600">
                      Blood components have a limited shelf life, making regular donations essential to maintain adequate supplies.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-bloodlink-red/10 rounded-full flex items-center justify-center mt-1 shrink-0">
                    <Droplet className="h-4 w-4 text-bloodlink-red" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Community Connection</h3>
                    <p className="text-gray-600">
                      Donating blood creates a direct connection between donors and recipients in their communities.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/register">
                  <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80">
                    Join BloodLink Today
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="/lovable-uploads/c3d78327-86cc-493c-9f7c-dfc2bf6fa310.png" 
                alt="Blood donation" 
                className="rounded-lg shadow-lg object-cover w-full h-64"
              />
              <img 
                src="/lovable-uploads/9adedfc9-a94e-46b6-8ab2-6c318eb09bbb.png" 
                alt="Hospital setting" 
                className="rounded-lg shadow-lg object-cover w-full h-64"
              />
              <img 
                src="/lovable-uploads/ba32ce91-0b65-4a0e-8288-b44fa693284c.png" 
                alt="Blood types" 
                className="rounded-lg shadow-lg object-cover w-full h-64"
              />
              <img 
                src="/lovable-uploads/d5ec777f-5f9f-4f63-ae6d-5ffe1e41dd8c.png" 
                alt="Nurse and patient" 
                className="rounded-lg shadow-lg object-cover w-full h-64"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-bloodlink-pink py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Blood Type Compatibility</h2>
            <p className="text-gray-600">
              Understanding blood type compatibility is crucial for successful transfusions.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-3 px-6 text-left font-bold border-b">Blood Type</th>
                  <th className="py-3 px-6 text-left font-bold border-b">Can Donate To</th>
                  <th className="py-3 px-6 text-left font-bold border-b">Can Receive From</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-6 border-b">A+</td>
                  <td className="py-3 px-6 border-b">A+, AB+</td>
                  <td className="py-3 px-6 border-b">A+, A-, O+, O-</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b">A-</td>
                  <td className="py-3 px-6 border-b">A+, A-, AB+, AB-</td>
                  <td className="py-3 px-6 border-b">A-, O-</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b">B+</td>
                  <td className="py-3 px-6 border-b">B+, AB+</td>
                  <td className="py-3 px-6 border-b">B+, B-, O+, O-</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b">B-</td>
                  <td className="py-3 px-6 border-b">B+, B-, AB+, AB-</td>
                  <td className="py-3 px-6 border-b">B-, O-</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b">AB+</td>
                  <td className="py-3 px-6 border-b">AB+ only</td>
                  <td className="py-3 px-6 border-b">All blood types</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b">AB-</td>
                  <td className="py-3 px-6 border-b">AB+, AB-</td>
                  <td className="py-3 px-6 border-b">A-, B-, AB-, O-</td>
                </tr>
                <tr>
                  <td className="py-3 px-6 border-b">O+</td>
                  <td className="py-3 px-6 border-b">A+, B+, AB+, O+</td>
                  <td className="py-3 px-6 border-b">O+, O-</td>
                </tr>
                <tr>
                  <td className="py-3 px-6">O-</td>
                  <td className="py-3 px-6">All blood types</td>
                  <td className="py-3 px-6">O- only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-r from-bloodlink-red to-red-600 text-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a donor, recipient, or medical professional, BloodLink connects you with those who need your help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                className="bg-white text-bloodlink-red hover:bg-gray-100"
              >
                Sign Up Today
              </Button>
            </Link>
            <Link to="/hospitals">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/20"
              >
                Find Hospitals
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
