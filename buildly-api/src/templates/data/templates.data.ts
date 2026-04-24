import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-portfolio',
    name: 'Modern Portfolio',
    description: 'Complete portfolio with navbar, hero, about, features, FAQ, contact & footer',
    thumbnail: 'https://images.unsplash.com/photo-1516321310764-9f3c2845bbcd?w=400&q=80',
    category: 'portfolio',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        meta: { title: 'Home' },
        elements: [
          {
            "id": uuidv4(),
            "type": "navbar",
            "x": 0,
            "y": 0,
            "width": 1200,
            "height": 70,
            "zIndex": 100,
            "content": "MyPortfolio | Home · About · Services · FAQ · Contact",
            "styles": {
              "backgroundColor": "rgba(255,255,255,0.95)",
              "backdropFilter": "blur(20px)",
              "borderBottom": "1px solid rgba(255,255,255,0.2)",
              "fontSize": "16px",
              "fontWeight": "600",
              "color": "#2d3748",
              "paddingLeft": "40px",
              "paddingRight": "40px",
              "display": "flex",
              "alignItems": "center",
              "justifyContent": "space-between"
            },
            "visible": true,
            "locked": false
          },
          {
            "id": uuidv4(),
            "type": "heading",
            "x": 80,
            "y": 120,
            "width": 600,
            "height": 100,
            "zIndex": 10,
            "content": "Hi, I'm John Doe",
            "styles": {
              "fontSize": "64px",
              "fontWeight": "800",
              "color": "#ffffff",
              "backgroundColor": "transparent",
              "textAlign": "left",
              "lineHeight": "1.1",
              "letterSpacing": "-0.02em"
            },
            "visible": true,
            "locked": false
          },
          {
            "id": uuidv4(),
            "type": "text",
            "x": 80,
            "y": 240,
            "width": 550,
            "height": 80,
            "zIndex": 9,
            "content": "Creative Designer & Developer creating amazing user experiences.",
            "styles": {
              "fontSize": "20px",
              "fontWeight": "400",
              "color": "rgba(255,255,255,0.9)",
              "backgroundColor": "transparent",
              "textAlign": "left",
              "lineHeight": "1.6"
            },
            "visible": true,
            "locked": false
          },
          {
            "id": uuidv4(),
            "type": "button",
            "x": 80,
            "y": 360,
            "width": 180,
            "height": 52,
            "zIndex": 11,
            "content": "View My Work",
            "styles": {
              "fontSize": "16px",
              "fontWeight": "700",
              "color": "#2d3748",
              "backgroundColor": "#ffffff",
              "borderRadius": "50px",
              "textAlign": "center",
              "boxShadow": "0 10px 30px rgba(0,0,0,0.2)"
            },
            "visible": true,
            "locked": false
          },
          {
            "id": uuidv4(),
            "type": "button",
            "x": 280,
            "y": 360,
            "width": 160,
            "height": 52,
            "zIndex": 11,
            "content": "Contact Me",
            "styles": {
              "fontSize": "16px",
              "fontWeight": "600",
              "color": "#ffffff",
              "backgroundColor": "transparent",
              "border": "2px solid rgba(255,255,255,0.5)",
              "borderRadius": "50px",
              "textAlign": "center"
            },
            "visible": true,
            "locked": false
          }
        ],
      }
    ],
    meta: { title: 'My Portfolio', description: 'Modern portfolio template', language: 'en' }
  },
  {
    id: 'tpl-business',
    name: 'Business',
    description: 'Professional business site',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
    category: 'business',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        background: '#f8fafc',
        meta: { title: 'Home' },
        elements: []
      }
    ],
    meta: { title: 'Business', description: 'Professional business template', language: 'en' }
  },
  {
    id: 'tpl-blank',
    name: 'Blank',
    description: 'Start from scratch',
    thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400&q=80',
    category: 'blank',
    pages: [
      {
        id: 'home',
        name: 'Home',
        path: '/',
        background: '#ffffff',
        meta: { title: 'Home' },
        elements: []
      }
    ],
    meta: { title: 'Blank', description: '', language: 'en' }
  }
];
