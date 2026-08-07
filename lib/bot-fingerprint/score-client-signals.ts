export type ClientFingerprintSignals = {
  webdriver?: boolean
  pluginsLength?: number
  languagesLength?: number
  chromeMissing?: boolean
  webglSwiftShader?: boolean
  canvasEmpty?: boolean
  userAgent?: string
}

export type FingerprintScoreResult = {
  flags: string[]
  suspicious: boolean
}

export function scoreClientSignals(signals: ClientFingerprintSignals): FingerprintScoreResult {
  const flags: string[] = []
  const ua = signals.userAgent?.toLowerCase() ?? ""

  if (signals.webdriver) flags.push("webdriver")
  if (signals.chromeMissing && ua.includes("chrome") && !ua.includes("edg")) {
    flags.push("chrome_object_missing")
  }
  if (signals.pluginsLength === 0 && ua.includes("chrome")) {
    flags.push("no_plugins")
  }
  if (signals.languagesLength === 0) flags.push("no_languages")
  if (signals.webglSwiftShader) flags.push("webgl_swiftshader")
  if (signals.canvasEmpty) flags.push("empty_canvas")

  return {
    flags,
    suspicious: flags.length >= 2,
  }
}
