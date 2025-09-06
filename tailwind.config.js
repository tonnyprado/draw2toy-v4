/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        draw2toy: {
          primary:   "#FF7BA3", // rosa pastel
          secondary: "#79D6C9", // menta
          accent:    "#FFC27A", // durazno
          neutral:   "#2E2A1F", // café oscuro (buen contraste)
          "base-100":"#FFFBEA", // crema principal
          "base-200":"#FFF5D6",
          "base-300":"#FFEFBF",
          info:      "#7CC7FF",
          success:   "#7AD1A6",
          warning:   "#F7C56C",
          error:     "#F28C8C",
        },
      },
      "light",
    ],
  },  
}
