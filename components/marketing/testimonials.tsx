import { Star } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      avatar: "SC",
      content:
        "Bloks has transformed how our team collaborates. The nested file structure and powerful search make it indispensable.",
      rating: 5,
    },
    {
      name: "Alex Rodriguez",
      role: "Startup Founder",
      avatar: "AR",
      content:
        "Finally, a workspace that grows with us. From simple notes to complex nested documentation, Bloks handles it all beautifully.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Content Creator",
      avatar: "EJ",
      content:
        "The ability to nest files infinitely helps me organize my thoughts perfectly. Love the clean interface!",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Loved by teams worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience with Bloks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-8 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-current"
                  />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-primary-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
