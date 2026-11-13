import { Component, type ReactNode } from 'react'
import { describeLoadError, failedAsset } from '../world/loadModel'
import { Notice } from './Notice'

interface Props {
  /** Every asset URL the wrapped scene loads, so a failure can be traced to a file. */
  urls: string[]
  children: ReactNode
}

interface State {
  error: unknown
  failed: boolean
}

/** Replaces a scene with a readable notice when one of its assets fails to load. */
export class AssetErrorBoundary extends Component<Props, State> {
  override state: State = { error: undefined, failed: false }

  static getDerivedStateFromError(error: unknown): State {
    return { error, failed: true }
  }

  override render() {
    if (!this.state.failed) return this.props.children
    const url = failedAsset(this.state.error, this.props.urls)
    if (url) return <Notice {...describeLoadError(url, undefined)} />
    return (
      <Notice
        title="The 3D scene stopped working"
        body="Something went wrong while drawing the scene. Reload the page to try again."
      />
    )
  }
}
