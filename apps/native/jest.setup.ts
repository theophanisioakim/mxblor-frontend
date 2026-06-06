import { jest } from "@jest/globals"
import "react-native-gesture-handler/jestSetup"

jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock")
)
