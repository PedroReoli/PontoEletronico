                        // <div className="space-y-4">
                        //   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        //     <div>
                        //       <p className="text-sm font-medium">Autenticação em Dois Fatores</p>
                        //       <p className="text-xs text-gray-500">Habilitar 2FA para contas de usuário</p>
                        //     </div>
                        //     <label className="relative inline-flex items-center cursor-pointer">
                        //       <input
                        //         type="checkbox"
                        //         checked={settings.authentication.twoFactorEnabled}
                        //         onChange={(e) => handleInputChange("authentication", "authentication", "twoFactorEnabled", e.target.checked)}
                        //         className="sr-only peer"
                        //       />
                        //       <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        //     </label>
                        //   </div>

                        //   <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        //     <div>
                        //       <p className="text-sm font-medium">2FA Obrigatório</p>
                        //       <p className="text-xs text-gray-500">Exigir 2FA para todos os usuários</p>
                        //     </div>
                        //     <label className="relative inline-flex items-center cursor-pointer">
                        //       <input
                        //         type="checkbox"
                        //         checked={settings.authentication.twoFactorRequired}
                        //         onChange={(e) => handleInputChange("authentication", "authentication", "twoFactorRequired", e.target.checked)}
                        //         disabled={!settings.authentication.twoFactorEnabled}
                        //         className="sr-only peer"
                        //       />
                        //       <div className={`w-9 h-5 ${!settings.authentication.twoFactorEnabled ? 'bg-gray-100' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600`}></div>
                        //     </label>
                        //   </div>

                        //   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        //     <div>
                        //       <label htmlFor="sessionTimeout" className="block text-xs font-medium text-gray-700 mb-1">
                        //         Timeout de Sessão (minutos)
                        //       </label>
                        //       <input
                        //         type="number"
                        //         id="sessionTimeout"
                        //         value={settings.authentication.sessionTimeout}
                        //         onChange={(e) => handleInputChange("authentication", "authentication", "sessionTimeout", Number(e.target.value))}
                        //         min="5"
                        //         max="1440"
                        //         className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
                        //       />
                        //     </div>
                        //     <div>
                        //       <label htmlFor="maxLoginAttempts" className="block text-xs font-medium text-gray-700 mb-1">
                        //         Máximo de Tentativas de Login
                        //       </label>
                        //       <input
                        //         type="number"
                        //         id="maxLoginAttempts"
                        //         value={settings.authentication.maxLoginAttempts}
                        //         onChange={(e) => handleInputChange("authentication", "authentication", "maxLoginAttempts", Number(e.target.value))}
                        //         min="1"
                        //         max="10"
                        //         className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
                        //       />
                        //     </div>
                        //     <div>
                        //       <label htmlFor="lockoutDuration" className="block text-xs font-medium text-gray-700 mb-1">
                        //         Duração do Bloqueio (minutos)
                        //       </label>
                        //       <input
                        //         type="number"
                        //         id="lockoutDuration"
                        //         value={settings.authentication.lockoutDuration}
                        //         onChange={(e) => handleInputChange("authentication", "authentication", "lockoutDuration", Number(e.target.value))}
                        //         min="5"
                        //         max="1440"
                        //         className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
                        //       />
                        //     </div>
                        //   </div>

                        //   <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100">
                        //     <div className="flex items-start gap-2">
                        //       <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                        //       <div>
                        //         <p className="text-sm font-medium text-amber-700">Atenção</p>
                        //         <p className="text-xs text-amber-600">
                        //           Alterações nas configurações de autenticação podem afetar todos os usuários do sistema. 
                        //           Certifique-se de comunicar as mudanças antes de implementá-las.
                        //         </p>
                        //       </div>
