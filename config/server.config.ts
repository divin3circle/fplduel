const config = {
  SERVER_BACKEND_URL: {
    development: "http://localhost:8080",
    production: "",
  },
  SMART_CONTRACT_SERVER_URL: {
    development: "http://localhost:3000",
    production: "",
  },
};

export function getServerUrl(env: "development" | "production"): string {
  return config.SERVER_BACKEND_URL[env];
}

export function getContractServerUrl(
  env: "development" | "production"
): string {
  return config.SMART_CONTRACT_SERVER_URL[env];
}

export function getEnvironment(): "development" | "production" {
  return process.env.NODE_ENV === "production" ? "production" : "development";
}
