with open("app/queue/page.tsx", "r") as f:
    lines = f.readlines()
with open("app/queue/page.tsx", "w") as f:
    f.writelines(lines[:722] + lines[977:])
