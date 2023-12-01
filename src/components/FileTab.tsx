import React from 'react'

function getExtension(path:string){
  let bits = path.split('.')
  if(bits.length === 1) return ''
  return bits[bits.length - 1];
}

export const FileTab = ({ name, style }: { name: string, style?: React.StyleHTMLAttributes<HTMLDivElement> }) => {
  const ext = getExtension(name)

  return <div style={{
    padding: '2px 10px 2px 8px',
    width: name.length * 10 + 15,
    backgroundColor: '#1e1e1e',
    height: 30,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...(style ?? {}),
  }}>
    {ext ? <img src={`/img/icons/file_type_${getExtension(name)}.svg`} height={25} /> : <></>}
    <span>{name}</span>
  </div>
}