let faceapi: typeof import("face-api.js") | null = null;

let loadingPromise: Promise<
  typeof import("face-api.js")
> | null = null;

export const loadFaceModels = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (faceapi) {
    return faceapi;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    console.log("Loading face-api...");

    faceapi = await import("face-api.js");

    await faceapi.nets.tinyFaceDetector.loadFromUri(
      "/models",
    );

    console.log("Tiny Face Detector loaded");

    await faceapi.nets.faceLandmark68Net.loadFromUri(
      "/models",
    );

    console.log("Face Landmark model loaded");

    await faceapi.nets.faceRecognitionNet.loadFromUri(
      "/models",
    );

    console.log("Face Recognition model loaded");

    console.log("All face models loaded");

    return faceapi;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    faceapi = null;

    throw error;
  }
};

export const getFaceAPI = () => faceapi;