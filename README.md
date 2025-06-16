# TaxMaster BD

A modern web application for calculating income tax in Bangladesh for the income year of 2024-2025 & 2025-2026. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 💰 Calculate income tax based on Bangladesh tax rules
- 📊 Detailed breakdown of tax calculations
- 🎨 Modern UI with glass morphism effects
- 📱 Responsive design for all devices
- 🎯 Real-time calculations
- 📈 Visual representation of tax breakdown
- 💡 User-friendly interface

## Use Cases

- Employee AIT Calculation
- Salary Negotiation
- Income tax calculation for individuals with income from salary

## Out of Scope

- Income from any other sources except salary
- Asset and liabilities management & calculation

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Charts:** Recharts
- **State Management:** React Hooks

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taxmaster-bd.git
   cd taxmaster-bd
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
taxmaster-bd/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   └── ...            # Feature components
│   ├── lib/               # Utility functions
│   └── hooks/             # Custom React hooks
├── public/                # Static assets
└── ...                   # Configuration files
```

## Key Components

- `TaxCalculatorForm`: Main form for tax calculation input
- `TaxResultsDisplay`: Displays tax calculation results
- `ThemeProvider`: Manages application theme
- `Toaster`: Handles toast notifications

## Features in Detail

### Tax Calculation
- Supports both monthly and annual income input
- Handles bonuses and investments
- Calculates standard exemptions
- Applies progressive tax rates
- Shows detailed breakdown of calculations

### UI/UX
- Clean, modern interface
- Glass morphism effects
- Responsive design
- Interactive charts
- Toast notifications for user feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

## Live - https://taxmaster-bd.vercel.app/

## 🧾 Features

- 💼 Input detailed salary breakdowns
- 📊 Generate income tax calculations instantly
- 🗃️ Batch processing for multiple employees
- 📥 Download tax sheets in printable format
- 🔐 Secure data handling
- 🌐 Country-specific logic (currently supports **Bangladesh**)

## 🛠 Tech Stack

- **Frontend**: Angular
- **Backend**: Python (Flask/FastAPI)
- **Deployment**: Google Cloud / Firebase
- **Storage**: Secure file handling (TBD)

## 🧑‍💼 Use Case

- HR departments managing monthly payroll
- Finance officers preparing annual tax returns
- Companies complying with Bangladesh NBR tax regulations

## 🚀 Getting Started (Development)

Clone the repo and run locally:

```bash
git clone https://github.com/your-username/taxmaster-bd.git
cd taxmaster-bd
