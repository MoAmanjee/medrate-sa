'use client'

import { useEffect, useRef } from 'react'

interface MapEmbedProps {
  coords: { lat: number; lng: number }
  zoom?: number
}

export default function MapEmbed({ coords, zoom = 15 }: MapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize Google Maps
    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: coords,
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    // Add marker
    new (window as any).google.maps.Marker({
      position: coords,
      map: map,
      title: 'Doctor Location'
    })
  }, [coords, zoom])

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-xl overflow-hidden"
      style={{ minHeight: '256px' }}
    />
  )
}

