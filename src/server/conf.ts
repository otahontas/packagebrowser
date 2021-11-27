export const statusFilePath = "/var/lib/status";
export const statusFileExampleUrl =
  "https://gist.githubusercontent.com/lauripiispanen/29735158335170c27297422a22b48caa/raw/61a0f1150f33a1f31510b8e3a70cbac970892b2f/status.real";
export const port = process.env.PORT || 8081;
export const inProduction = process.env.NODE_ENV === "production";
export const address = inProduction ? "0.0.0.0" : undefined;
