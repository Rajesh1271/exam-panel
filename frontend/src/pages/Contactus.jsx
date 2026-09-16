import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await axios.post("/api/contact", form);
      setStatus({ type: "success", msg: "Message sent successfully!" });
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus({ type: "error", msg: "Failed to send message." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">

      {/* MAIN */}
      <main className="flex-grow max-w-7xl mx-auto px-5 py-16 w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition hover:shadow-2xl">
          <div className="grid md:grid-cols-2 gap-10 items-center p-10">

            {/* IMAGE */}
            <div className="flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
                alt="Contact Online Exam Panel"
                className="rounded-xl w-full max-w-md shadow-lg transform hover:scale-105 transition duration-300"
              />
            </div>

            {/* FORM SECTION */}
            <div>
              <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
                Contact <span className="text-indigo-600">Us</span>
              </h2>

              <p className="text-gray-600 mb-8">
                Have questions or need support? Our team is always here to help you.
                Reach out anytime.
              </p>

              {/* INFO */}
              <div className="mb-8 space-y-2 text-sm text-gray-700">
                <p><strong>Email:</strong> help@onlineexam.com</p>
                <p><strong>Phone:</strong> 012-345-6789</p>
                <p><strong>Support:</strong> 1800-000-0000</p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    rows="4"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                {status && (
                  <p
                    className={`text-sm text-center ${
                      status.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {status.msg}
                  </p>
                )}
              </form>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-5 text-center text-sm">
        © {new Date().getFullYear()} Online Exam Panel. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Contact;
