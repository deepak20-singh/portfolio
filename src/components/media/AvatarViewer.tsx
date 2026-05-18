import { forwardRef, useImperativeHandle } from 'react';
import { useThreeScene, type ThreeSceneOpts, type SceneAPI } from '../../hooks/useThreeScene';

interface Props extends ThreeSceneOpts {
  style?:     React.CSSProperties;
  className?: string;
}

export type AvatarViewerHandle = SceneAPI;

export const AvatarViewer = forwardRef<AvatarViewerHandle, Props>(
  function AvatarViewer({ style, className, ...opts }, ref) {
    const { containerRef, apiRef } = useThreeScene(opts);

    useImperativeHandle(ref, () => ({
      playClip: (url) => apiRef.current?.playClip(url),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    return (
      <div
        ref={containerRef}
        className={`avatar-3d${className ? ` ${className}` : ''}`}
        style={style}
      />
    );
  },
);
