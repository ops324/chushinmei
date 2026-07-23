import Image from 'next/image'

type Props = {
  src: string | null
  name: string
  size: number
}

export default function Avatar({ src, name, size }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase()
  return (
    <span
      className="flex items-center justify-center rounded-full bg-accent text-white font-medium shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initial}
    </span>
  )
}
