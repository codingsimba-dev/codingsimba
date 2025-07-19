import React from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function ContactForm() {
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h2 className="mb-6 text-2xl font-bold">Leave a message</h2>
      <form
        ref={formRef}
        action={`https://formsubmit.co/4e6d736d95b932b2d66e894716711b8e`}
        method="POST"
        className="border-border bg-card rounded-xl border p-6 shadow-sm"
      >
        {/* <input
          type="hidden"
          name="_next"
          value="http://localhost:5173/contact/success"
        /> */}
        {/* <input
          type="hidden"
          name="_webhook"
          value="https://codingsimba.com/contact/webhook"
        /> */}
        {/* <input type="hidden" name="_cc" value="christohybrid185@gmail.com" /> */}
        <input type="hidden" name="_captcha" />
        <input type="text" name="_honey" style={{ display: "none" }} />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="john@doe.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="_subject">Subject</Label>
            <Input
              type="text"
              name="_subject"
              placeholder="How can I help you?"
              required
              minLength={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              placeholder="Your message here..."
              name="message"
              rows={5}
              required
              minLength={10}
            />
          </div>
          <Button type="submit" className="w-full">
            Send Message{" "}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
