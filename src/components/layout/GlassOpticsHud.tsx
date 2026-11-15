import React, { useEffect, useId, useRef, useState } from 'react';
import { Button, Glass, Menu, Slider, Switch } from 'glisse';
import { DEFAULT_GLASS_OPTICS } from '../../data/portfolioData';
import type { GlassOpticsSettings } from '../../types/portfolio';

export interface GlassOpticsHudProps {
  settings: GlassOpticsSettings;
  onChange: (next: GlassOpticsSettings) => void;
  onReset: () => void;
}

export function syncGlassOpticsCssVars(settings: GlassOpticsSettings): void {
  if (typeof document === 'undefined') return;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--lg-blur', `${settings.blur}px`);
  rootStyle.setProperty('--lg-glass-bend', `${settings.bend}`);
  rootStyle.setProperty('--lg-glass-dispersion', `${settings.dispersion}`);
}

export function GlassOpticsHud({
  settings,
  onChange,
  onReset,
}: GlassOpticsHudProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverId = useId();
  const blurSliderId = useId();
  const bendSliderId = useId();
  const dispersionSliderId = useId();
  const pauseSwitchId = useId();

  useEffect(() => {
    syncGlassOpticsCssVars(settings);
  }, [settings]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (target.closest('[role="menu"], .lg-menu')) return;
      setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const applyPreset = (preset: Omit<GlassOpticsSettings, 'pauseContours'>) => {
    onChange({
      ...preset,
      pauseContours: settings.pauseContours,
    });
  };

  return (
    <div ref={wrapperRef} className="optics-hud-wrapper">
      <Button
        ref={triggerRef}
        type="button"
        variant="glass"
        className="optics-hud-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={popoverId}
        aria-label="Liquid Glass Optics HUD"
        onClick={() => setOpen((prev) => !prev)}
      >
        Optics
      </Button>

      {open && (
        <Glass
          id={popoverId}
          className="optics-hud-popover"
          role="dialog"
          aria-label="Liquid Glass Optics"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <div className="optics-hud-header">
            <span className="optics-hud-title">Optics HUD</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                type="button"
                variant="glass"
                aria-label="Reset Optics"
                onClick={onReset}
              >
                Reset
              </Button>
              <Menu
                aria-label="Optics presets"
                align="end"
                items={[
                  {
                    label: 'Default Aerospace',
                    onSelect: () =>
                      applyPreset({
                        blur: DEFAULT_GLASS_OPTICS.blur,
                        bend: DEFAULT_GLASS_OPTICS.bend,
                        dispersion: DEFAULT_GLASS_OPTICS.dispersion,
                      }),
                  },
                  {
                    label: 'High Refraction',
                    onSelect: () =>
                      applyPreset({
                        blur: 22,
                        bend: 2.6,
                        dispersion: 1.2,
                      }),
                  },
                  {
                    label: 'Subtle Frosted',
                    onSelect: () =>
                      applyPreset({
                        blur: 8,
                        bend: 0.6,
                        dispersion: 0.2,
                      }),
                  },
                  'separator',
                  {
                    label: 'Reset Optics',
                    onSelect: onReset,
                  },
                ]}
              />
            </div>
          </div>

          <div className="optics-control-group">
            <label className="optics-control-label" htmlFor={blurSliderId}>
              <span>Blur</span>
              <span className="optics-control-value">{settings.blur}px</span>
            </label>
            <Slider
              id={blurSliderId}
              aria-label="Blur"
              min={4}
              max={28}
              step={1}
              value={settings.blur}
              onValueChange={(blur) => onChange({ ...settings, blur })}
            />
          </div>

          <div className="optics-control-group">
            <label className="optics-control-label" htmlFor={bendSliderId}>
              <span>Glass Bend</span>
              <span className="optics-control-value">
                {settings.bend.toFixed(1)}
              </span>
            </label>
            <Slider
              id={bendSliderId}
              aria-label="Glass Bend"
              min={0}
              max={3}
              step={0.1}
              value={settings.bend}
              onValueChange={(bend) =>
                onChange({ ...settings, bend: Number(bend.toFixed(1)) })
              }
            />
          </div>

          <div className="optics-control-group">
            <label
              className="optics-control-label"
              htmlFor={dispersionSliderId}
            >
              <span>Dispersion</span>
              <span className="optics-control-value">
                {settings.dispersion.toFixed(2)}
              </span>
            </label>
            <Slider
              id={dispersionSliderId}
              aria-label="Dispersion"
              min={0}
              max={1.5}
              step={0.05}
              value={settings.dispersion}
              onValueChange={(dispersion) =>
                onChange({
                  ...settings,
                  dispersion: Number(dispersion.toFixed(2)),
                })
              }
            />
          </div>

          <div className="optics-switch-row">
            <label className="optics-control-label" htmlFor={pauseSwitchId}>
              <span>Pause Contours</span>
            </label>
            <Switch
              id={pauseSwitchId}
              aria-label="Pause Contours"
              checked={settings.pauseContours}
              onCheckedChange={(pauseContours) =>
                onChange({ ...settings, pauseContours })
              }
            />
          </div>
        </Glass>
      )}
    </div>
  );
}
