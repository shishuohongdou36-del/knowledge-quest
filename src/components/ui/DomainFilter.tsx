import { motion } from 'framer-motion'
import type { Domain } from '@/types'
import { DOMAINS } from '@/data/domains'

interface Props {
  selected: Domain | null
  onSelect: (domain: Domain | null) => void
}

export function DomainFilter({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterButton
        label="全部"
        icon="🌐"
        isActive={selected === null}
        color="#6b7280"
        onClick={() => onSelect(null)}
      />
      {DOMAINS.map((d) => (
        <FilterButton
          key={d.name}
          label={d.name}
          icon={d.icon}
          isActive={selected === d.name}
          color={d.color}
          onClick={() => onSelect(selected === d.name ? null : d.name)}
        />
      ))}
    </div>
  )
}

function FilterButton({
  label,
  icon,
  isActive,
  color,
  onClick,
}: {
  label: string
  icon: string
  isActive: boolean
  color: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-4 py-2 rounded-xl text-sm font-medium transition-colors border"
      style={{
        borderColor: isActive ? `${color}60` : '#374151',
        backgroundColor: isActive ? `${color}15` : 'transparent',
        color: isActive ? color : '#9ca3af',
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          layoutId="domain-highlight"
          style={{
            border: `1.5px solid ${color}50`,
          }}
          transition={{ type: 'spring', damping: 25 }}
        />
      )}
    </motion.button>
  )
}
