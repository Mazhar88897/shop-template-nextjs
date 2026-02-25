export type BlogPost = {
  id: number;
  dateLabel: string;
  title: string;
  emoji: string;
  image: string;
  excerpt: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    dateLabel: "FEB 5, 2026",
    title: "Work In Progress, Part 15",
    emoji: "🛠️",
    image: "/product.jpg",
    excerpt:
      "Learn about January’s releases, including even more features to help creators grow their audience and convert more leads.",
  },
  {
    id: 2,
    dateLabel: "JAN 26, 2026",
    title: "Why the Future of Design Is Less Flash and More Thought",
    emoji: "🧠",
    image: "/product_1.png",
    excerpt:
      "We explore why thoughtful design systems are beating one-off visuals, and how teams can stay focused on long‑term impact.",
  },
  {
    id: 3,
    dateLabel: "JAN 10, 2026",
    title: "How to Keep a Creative Habit Going All Year",
    emoji: "📅",
    image: "/product_2.png",
    excerpt:
      "From tiny daily rituals to bigger monthly projects, here’s how successful creatives stay inspired without burning out.",
  },
  {
    id: 4,
    dateLabel: "DEC 20, 2025",
    title: "Building a Brand System That Actually Scales",
    emoji: "📐",
    image: "/product_3.png",
    excerpt:
      "See how consistent grids, typography, and color choices make it easier to ship new campaigns in days instead of weeks.",
  },
  {
    id: 5,
    dateLabel: "DEC 8, 2025",
    title: "Designing Dashboards People Love to Use",
    emoji: "📊",
    image: "/product_4.png",
    excerpt:
      "We break down real examples of dashboards that surface just enough detail without overwhelming people with data.",
  },
  {
    id: 6,
    dateLabel: "NOV 30, 2025",
    title: "What We Learned Shipping Weekly UI Experiments",
    emoji: "🧪",
    image: "/product.jpg",
    excerpt:
      "A look behind the scenes at our experiment pipeline, what worked, what failed, and how fast iteration changed our roadmap.",
  },
  {
    id: 7,
    dateLabel: "NOV 12, 2025",
    title: "Finding Your Visual Voice as a Team",
    emoji: "🎨",
    image: "/product_1.png",
    excerpt:
      "Tips for aligning a growing design team around a shared style without losing the personality of individual contributors.",
  },
  {
    id: 8,
    dateLabel: "OCT 28, 2025",
    title: "Patterns from 1,000 Design Critiques",
    emoji: "📝",
    image: "/product_2.png",
    excerpt:
      "After hundreds of critiques, we found a few repeat patterns that separate helpful feedback from noise.",
  },
  {
    id: 9,
    dateLabel: "OCT 15, 2025",
    title: "Designing for Dark Mode from Day One",
    emoji: "🌙",
    image: "/product_3.png",
    excerpt:
      "Instead of bolting on dark mode at the end, we share how to bake contrast, color, and accessibility in from the start.",
  },
  {
    id: 10,
    dateLabel: "SEP 29, 2025",
    title: "Small Animations, Big Delight",
    emoji: "✨",
    image: "/product_4.png",
    excerpt:
      "Subtle motion can say more than full‑screen effects. Here are a few micro‑interactions that made our product feel alive.",
  },
  {
    id: 11,
    dateLabel: "SEP 10, 2025",
    title: "Designing with Real Data, Not Lorem Ipsum",
    emoji: "📚",
    image: "/product.jpg",
    excerpt:
      "We swapped placeholder copy for real customer stories and immediately uncovered layout, truncation, and hierarchy issues.",
  },
  {
    id: 12,
    dateLabel: "AUG 25, 2025",
    title: "Running Better Async Design Reviews",
    emoji: "💬",
    image: "/product_1.png",
    excerpt:
      "Screenshots, Looms, and structured prompts changed the way our team reviews work across time zones.",
  },
  {
    id: 13,
    dateLabel: "AUG 8, 2025",
    title: "From Sketch to Production in One Week",
    emoji: "⚡",
    image: "/product_2.png",
    excerpt:
      "We walk through one feature from napkin sketch to shipped, highlighting the tools and trade‑offs along the way.",
  },
  {
    id: 14,
    dateLabel: "JUL 22, 2025",
    title: "How We Document Components Without Slowing Down",
    emoji: "📘",
    image: "/product_3.png",
    excerpt:
      "Good docs don’t have to be heavy. Here’s the lightweight structure that keeps our design system trusted and adopted.",
  },
  {
    id: 15,
    dateLabel: "JUL 5, 2025",
    title: "Creating Accessible Color Palettes",
    emoji: "🎯",
    image: "/product_4.png",
    excerpt:
      "Color contrast doesn’t have to kill your brand. We share a few palette tricks that keep things vibrant and readable.",
  },
  {
    id: 16,
    dateLabel: "JUN 18, 2025",
    title: "What We Learned From Our First Design Offsite",
    emoji: "🏕️",
    image: "/product.jpg",
    excerpt:
      "Bringing everyone into the same room for three days changed our roadmap and our rituals for the rest of the year.",
  },
  {
    id: 17,
    dateLabel: "JUN 3, 2025",
    title: "The Power of Saying No to Features",
    emoji: "🚫",
    image: "/product_1.png",
    excerpt:
      "Sometimes the best design call is deciding not to ship. We look at a few features we cut and why.",
  },
  {
    id: 18,
    dateLabel: "MAY 20, 2025",
    title: "Design Playgrounds: Shipping Without Stakes",
    emoji: "🌈",
    image: "/product_2.png",
    excerpt:
      "Side projects helped us uncover UI ideas that later made it into the main product with much more confidence.",
  },
  {
    id: 19,
    dateLabel: "MAY 2, 2025",
    title: "Making Empty States Feel Useful",
    emoji: "📭",
    image: "/product_3.png",
    excerpt:
      "Thoughtful empty states can teach, reassure, and guide — not just sit there until data shows up.",
  },
  {
    id: 20,
    dateLabel: "APR 15, 2025",
    title: "Designing Settings Screens That Don’t Overwhelm",
    emoji: "⚙️",
    image: "/product_4.png",
    excerpt:
      "Your most advanced users live in settings. We share patterns that keep things powerful but still easy to scan.",
  },
];

