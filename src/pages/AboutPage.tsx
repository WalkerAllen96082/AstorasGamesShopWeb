import React from 'react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">About Astora's Games Shop</h1>
      <div className="max-w-4xl mx-auto">
        <p className="text-lg mb-6">
          Welcome to Astora's Games Shop, your ultimate destination for all things gaming!
          We are passionate about bringing you the best selection of video games, gaming accessories,
          and related products from around the world.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4">
              To provide gamers with an unparalleled shopping experience, offering high-quality
              products at competitive prices, backed by exceptional customer service.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Latest video games for all platforms</li>
              <li>Gaming consoles and accessories</li>
              <li>Collectibles and merchandise</li>
              <li>Expert advice and reviews</li>
              <li>Fast and reliable shipping</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>If you have any questions or need assistance, don't hesitate to reach out to our team.</p>
          <p className="mt-2">Email: support@astorasgames.com</p>
        </div>
      </div>
    </div>
  );
};
