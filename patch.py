with open("app/components/LandingPage.tsx", "r") as f:
    lines = f.readlines()
lines.insert(-2, "    </div>\n")
with open("app/components/LandingPage.tsx", "w") as f:
    f.writelines(lines)
