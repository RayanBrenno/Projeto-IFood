import { passwordRules } from '../../utils/passwordRules'

interface PasswordChecklistProps {
  password: string
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <ul className="flex flex-col gap-1 mt-1">
      {passwordRules.map((rule) => {
        const met = rule.test(password)
        return (
          <li
            key={rule.id}
            className={`text-xs flex items-center gap-1.5 transition-colors ${
              met ? 'text-success' : 'text-red-500'
            }`}
          >
            <span>{met ? '✓' : '○'}</span>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
