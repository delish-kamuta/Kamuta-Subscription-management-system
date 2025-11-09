import { useLocation } from "react-router"
import { cn } from "~/lib/utils"

import React from "react";

interface props{
    title: string,
    description: string,
    action?: React.ReactNode,
}

export const Header = ({title , description, action}:props) => {
    const location = useLocation();
  return (
   <header className="header">
    <article>
        <div className="flex items-center gap-4">
          {action && <div className="flex items-center self-start">{action}</div>}
          <h1 className={cn("text-dark-100",
              location.pathname === '/'?'text-2xl md:text-4xl font-bold': "text-xl md:text-2xl font-semibold"
          )}>{title}</h1>
        </div>

        <p className={cn('text-gray-100 font-normal', location.pathname === '/'? 'text-base md:text-lg' :'text-sm md:text-lg')}>{description} </p>
    </article>

   </header>
  )
}
